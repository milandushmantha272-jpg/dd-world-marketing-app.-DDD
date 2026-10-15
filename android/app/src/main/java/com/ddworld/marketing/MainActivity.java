package com.ddworld.marketing;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.ddworld.marketing.bridge.NativeGpsBridge;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeGpsBridge.class);
        super.onCreate(savedInstanceState);
    }
}
