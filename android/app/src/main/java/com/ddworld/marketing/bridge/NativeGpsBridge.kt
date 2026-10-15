package com.ddworld.marketing.bridge

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.ddworld.marketing.service.LocationTrackingService

@CapacitorPlugin(name = "NativeGpsBridge")
class NativeGpsBridge : Plugin() {

    @PluginMethod
    fun startTracking(call: PluginCall) {
        val employeeId = call.getString("employeeId", "") ?: ""
        val agentCode = call.getString("agentCode", "") ?: ""
        val teamId = call.getString("teamId", "") ?: ""
        val trackingSessionId = call.getString("trackingSessionId", "") ?: ""

        if (employeeId.isEmpty() || trackingSessionId.isEmpty()) {
            call.reject("employeeId and trackingSessionId are required to start Native tracking")
            return
        }

        val context = context
        val prefs = context.getSharedPreferences("ddworld_native_gps", Context.MODE_PRIVATE)
        prefs.edit().apply {
            putString("employeeId", employeeId)
            putString("agentCode", agentCode)
            putString("teamId", teamId)
            putString("trackingSessionId", trackingSessionId)
            putBoolean("isAuthorizedSessionActive", true)
            apply()
        }

        val serviceIntent = Intent(context, LocationTrackingService::class.java).apply {
            action = LocationTrackingService.ACTION_START
            putExtra(LocationTrackingService.EXTRA_EMPLOYEE_ID, employeeId)
            putExtra(LocationTrackingService.EXTRA_AGENT_CODE, agentCode)
            putExtra(LocationTrackingService.EXTRA_TEAM_ID, teamId)
            putExtra(LocationTrackingService.EXTRA_SESSION_ID, trackingSessionId)
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
            val ret = JSObject()
            ret.put("status", "SUCCESS")
            ret.put("message", "Native Android Foreground Location Service Started")
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to start Native Location Service: ${e.message}", e)
        }
    }

    @PluginMethod
    fun stopTracking(call: PluginCall) {
        val context = context
        val prefs = context.getSharedPreferences("ddworld_native_gps", Context.MODE_PRIVATE)
        prefs.edit().putBoolean("isAuthorizedSessionActive", false).apply()

        val serviceIntent = Intent(context, LocationTrackingService::class.java).apply {
            action = LocationTrackingService.ACTION_STOP
        }

        try {
            context.startService(serviceIntent)
            val ret = JSObject()
            ret.put("status", "STOPPED")
            ret.put("message", "Native Android Location Service Stopped")
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to stop service: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getTrackingStatus(call: PluginCall) {
        val context = context
        val prefs = context.getSharedPreferences("ddworld_native_gps", Context.MODE_PRIVATE)
        val isAuthorized = prefs.getBoolean("isAuthorizedSessionActive", false)
        val isRunning = LocationTrackingService.isServiceRunning
        val sessionId = prefs.getString("trackingSessionId", "") ?: ""

        val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val isBatteryIgnored = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pm.isIgnoringBatteryOptimizations(context.packageName)
        } else {
            true
        }

        val ret = JSObject()
        ret.put("isServiceRunning", isRunning)
        ret.put("isAuthorized", isAuthorized)
        ret.put("activeSessionId", sessionId)
        ret.put("isBatteryOptimizationIgnored", isBatteryIgnored)
        call.resolve(ret)
    }
}
