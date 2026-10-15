package com.ddworld.marketing.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import java.util.Calendar
import java.util.TimeZone

class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "DDWorldBootReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d(TAG, "BootReceiver triggered with action: $action")

        if (Intent.ACTION_BOOT_COMPLETED == action || "android.intent.action.MY_PACKAGE_REPLACED" == action) {
            val prefs = context.getSharedPreferences("ddworld_native_gps", Context.MODE_PRIVATE)
            val employeeId = prefs.getString("employeeId", "") ?: ""
            val agentCode = prefs.getString("agentCode", "") ?: ""
            val teamId = prefs.getString("teamId", "") ?: ""
            val trackingSessionId = prefs.getString("trackingSessionId", "") ?: ""
            val isAuthorized = prefs.getBoolean("isAuthorizedSessionActive", false)

            // 1. Verify Authentication & Session state
            if (!isAuthorized || employeeId.isEmpty() || trackingSessionId.isEmpty()) {
                Log.d(TAG, "No authorized active tracking session found after boot. Will NOT auto-start tracking.")
                return
            }

            // 2. Verify Working Hours (08:00 AM to 08:00 PM Asia/Colombo)
            val colomboTimeZone = TimeZone.getTimeZone("Asia/Colombo")
            val calendar = Calendar.getInstance(colomboTimeZone)
            val hour = calendar.get(Calendar.HOUR_OF_DAY)
            if (hour !in 8..19) {
                Log.d(TAG, "Device booted outside authorized working hours ($hour:00 Colombo). Will NOT start tracking.")
                return
            }

            Log.d(TAG, "Valid authorized session verified after boot ($trackingSessionId). Resuming native service.")
            val serviceIntent = Intent(context, LocationTrackingService::class.java).apply {
                this.action = LocationTrackingService.ACTION_START
                putExtra(LocationTrackingService.EXTRA_EMPLOYEE_ID, employeeId)
                putExtra(LocationTrackingService.EXTRA_AGENT_CODE, agentCode)
                putExtra(LocationTrackingService.EXTRA_TEAM_ID, teamId)
                putExtra(LocationTrackingService.EXTRA_SESSION_ID, trackingSessionId)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }
    }
}
