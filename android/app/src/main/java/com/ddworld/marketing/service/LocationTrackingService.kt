package com.ddworld.marketing.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.location.Location
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.BatteryManager
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class LocationTrackingService : Service() {

    companion object {
        private const val TAG = "LocationTrackingService"
        const val CHANNEL_ID = "ddworld_location_channel"
        const val NOTIFICATION_ID = 8801
        
        const val ACTION_START = "com.ddworld.marketing.ACTION_START"
        const val ACTION_STOP = "com.ddworld.marketing.ACTION_STOP"
        
        const val EXTRA_EMPLOYEE_ID = "extra_employee_id"
        const val EXTRA_AGENT_CODE = "extra_agent_code"
        const val EXTRA_TEAM_ID = "extra_team_id"
        const val EXTRA_SESSION_ID = "extra_session_id"

        @Volatile
        var isServiceRunning = false
            private set
    }

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback

    private var employeeId: String = ""
    private var agentCode: String = ""
    private var teamId: String = ""
    private var trackingSessionId: String = ""

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        createNotificationChannel()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                for (location in locationResult.locations) {
                    processRealGpsLocation(location)
                }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        if (action == ACTION_STOP) {
            stopTrackingService()
            return START_NOT_STICKY
        }

        employeeId = intent?.getStringExtra(EXTRA_EMPLOYEE_ID) ?: getSavedPref("employeeId")
        agentCode = intent?.getStringExtra(EXTRA_AGENT_CODE) ?: getSavedPref("agentCode")
        teamId = intent?.getStringExtra(EXTRA_TEAM_ID) ?: getSavedPref("teamId")
        trackingSessionId = intent?.getStringExtra(EXTRA_SESSION_ID) ?: getSavedPref("trackingSessionId")

        if (employeeId.isNotEmpty()) {
            savePref("employeeId", employeeId)
            savePref("agentCode", agentCode)
            savePref("teamId", teamId)
            savePref("trackingSessionId", trackingSessionId)
        }

        startForeground(NOTIFICATION_ID, createForegroundNotification())
        isServiceRunning = true

        startRealLocationUpdates()

        return START_STICKY
    }

    private fun startRealLocationUpdates() {
        try {
            val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 15000L)
                .setMinUpdateIntervalMillis(5000L)
                .setWaitForAccurateLocation(false)
                .build()

            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
            Log.d(TAG, "Native FusedLocationProviderClient started successfully")
        } catch (e: SecurityException) {
            Log.e(TAG, "Location permission missing for Native Service", e)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start location updates", e)
        }
    }

    private fun processRealGpsLocation(location: Location) {
        // 1. Verify Working Hours (08:00 AM - 08:00 PM Asia/Colombo)
        if (!isApprovedWorkingHours()) {
            Log.d(TAG, "Outside approved working hours (08:00 AM - 08:00 PM Colombo). Skipping official record.")
            return
        }

        val batteryLevel = getBatteryLevel()
        val isNetworkAvailable = isNetworkOnline()
        val timestampIso = getIsoTimestamp(location.time)

        val recordJson = JSONObject().apply {
            put("employeeId", employeeId)
            put("agentCode", agentCode)
            put("teamId", teamId)
            put("trackingSessionId", trackingSessionId)
            put("latitude", location.latitude)
            put("longitude", location.longitude)
            put("accuracy", location.accuracy.toDouble())
            put("speed", location.speed.toDouble())
            put("heading", location.bearing.toDouble())
            put("timestamp", timestampIso)
            put("batteryLevel", batteryLevel)
            put("networkStatus", if (isNetworkAvailable) "ONLINE" else "OFFLINE")
            put("gpsStatus", "ACTIVE_HIGH_ACCURACY")
            put("appState", "BACKGROUND_NATIVE_SERVICE")
            put("source", "NATIVE_ANDROID_GPS")
        }

        Log.d(TAG, "REAL Native GPS Captured: lat=${location.latitude}, lng=${location.longitude}, acc=${location.accuracy}m")

        if (isNetworkAvailable) {
            syncRecordToCloud(recordJson)
            flushOfflineQueue()
        } else {
            enqueueOfflineRecord(recordJson)
        }
    }

    private fun isApprovedWorkingHours(): Boolean {
        val colomboTimeZone = TimeZone.getTimeZone("Asia/Colombo")
        val calendar = Calendar.getInstance(colomboTimeZone)
        val hour = calendar.get(Calendar.HOUR_OF_DAY)
        // 08:00 AM to 08:00 PM -> hours 8 through 19 inclusive (8:00 to 19:59)
        return hour in 8..19
    }

    private fun getBatteryLevel(): Int {
        val batteryStatus: Intent? = IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { filter ->
            registerReceiver(null, filter)
        }
        val level: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        return if (level >= 0 && scale > 0) (level * 100 / scale) else 100
    }

    private fun isNetworkOnline(): Boolean {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val net = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(net) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    private fun getIsoTimestamp(timeMs: Long): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        return sdf.format(Date(if (timeMs > 0) timeMs else System.currentTimeMillis()))
    }

    private fun syncRecordToCloud(record: JSONObject) {
        // Send via async HTTP thread to Cloud API / Firestore Proxy
        Thread {
            try {
                val url = URL("https://ais-dev-x3vgvdkcnqcxy6kg52vg7i-814098050496.asia-east1.run.app/api/native-gps-sync")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true
                conn.connectTimeout = 10000
                conn.readTimeout = 10000

                val writer = OutputStreamWriter(conn.outputStream)
                writer.write(record.toString())
                writer.flush()
                writer.close()

                val responseCode = conn.responseCode
                Log.d(TAG, "Cloud sync response code: $responseCode")
                conn.disconnect()
            } catch (e: Exception) {
                Log.e(TAG, "Network sync failed, queuing record offline", e)
                enqueueOfflineRecord(record)
            }
        }.start()
    }

    private fun enqueueOfflineRecord(record: JSONObject) {
        val prefs = getSharedPreferences("ddworld_gps_queue", Context.MODE_PRIVATE)
        val queueStr = prefs.getString("queue", "[]") ?: "[]"
        val array = JSONArray(queueStr)
        array.put(record)
        prefs.edit().putString("queue", array.toString()).apply()
        Log.d(TAG, "Offline GPS record queued. Queue count: ${array.length()}")
    }

    private fun flushOfflineQueue() {
        val prefs = getSharedPreferences("ddworld_gps_queue", Context.MODE_PRIVATE)
        val queueStr = prefs.getString("queue", "[]") ?: "[]"
        val array = JSONArray(queueStr)
        if (array.length() == 0) return

        Thread {
            try {
                val url = URL("https://ais-dev-x3vgvdkcnqcxy6kg52vg7i-814098050496.asia-east1.run.app/api/native-gps-batch-sync")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true

                val writer = OutputStreamWriter(conn.outputStream)
                writer.write(array.toString())
                writer.flush()
                writer.close()

                if (conn.responseCode == 200) {
                    prefs.edit().putString("queue", "[]").apply()
                    Log.d(TAG, "Flushed ${array.length()} offline records to cloud.")
                }
                conn.disconnect()
            } catch (e: Exception) {
                Log.e(TAG, "Offline queue flush error", e)
            }
        }.start()
    }

    private fun createForegroundNotification(): Notification {
        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("DD WORLD GPS Tracking Active 🟢")
            .setContentText("Field Location Service running in background")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)

        return builder.build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "DD WORLD Location Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Persistent Notification for DD WORLD Field Agent Background Tracking"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun stopTrackingService() {
        try {
            fusedLocationClient.removeLocationUpdates(locationCallback)
        } catch (e: Exception) {
            Log.e(TAG, "Error removing location updates", e)
        }
        isServiceRunning = false
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        Log.d(TAG, "Native Location Tracking Service stopped cleanly")
    }

    override fun onDestroy() {
        stopTrackingService()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun savePref(key: String, value: String) {
        val prefs = getSharedPreferences("ddworld_native_gps", Context.MODE_PRIVATE)
        prefs.edit().putString(key, value).apply()
    }

    private fun getSavedPref(key: String): String {
        val prefs = getSharedPreferences("ddworld_native_gps", Context.MODE_PRIVATE)
        return prefs.getString(key, "") ?: ""
    }
}
