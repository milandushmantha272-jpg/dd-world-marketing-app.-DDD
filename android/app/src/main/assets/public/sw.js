/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-53feb3a3'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "905018e99b0cd633c2cdd89efffcb4a9"
  }, {
    "url": "pwa-512x512.png",
    "revision": "905018e99b0cd633c2cdd89efffcb4a9"
  }, {
    "url": "pwa-192x192.png",
    "revision": "1eb49f498dc40c55faa49eb353c92e2d"
  }, {
    "url": "official-logo.png",
    "revision": "d9845dfeff2b8b39fb85674a9f1d8bf3"
  }, {
    "url": "manifest.json",
    "revision": "7b3bfee049efdc93c47a8aa88cba5716"
  }, {
    "url": "index.html",
    "revision": "343dcb152a6d1b1a8125338e4092913d"
  }, {
    "url": "icon.svg",
    "revision": "ad555edda2f4b3282d0f7c2c4bc4b2ca"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "60a97d18539c996ccab26ab0cd4ffbe0"
  }, {
    "url": "assets/workbox-window.prod.es5-BBnX5xw4.js",
    "revision": null
  }, {
    "url": "assets/index-um-I4D3t.js",
    "revision": null
  }, {
    "url": "assets/index-C2lqTLUK.css",
    "revision": null
  }, {
    "url": "assets/gemini-rUaI__8E.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "60a97d18539c996ccab26ab0cd4ffbe0"
  }, {
    "url": "icon.svg",
    "revision": "ad555edda2f4b3282d0f7c2c4bc4b2ca"
  }, {
    "url": "pwa-192x192.png",
    "revision": "1eb49f498dc40c55faa49eb353c92e2d"
  }, {
    "url": "pwa-512x512.png",
    "revision": "905018e99b0cd633c2cdd89efffcb4a9"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "905018e99b0cd633c2cdd89efffcb4a9"
  }, {
    "url": "manifest.webmanifest",
    "revision": "9d8764acb64e3d36a8cb4938c6a99560"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 20,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 20,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/images\.unsplash\.com\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "unsplash-images-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i, new workbox.CacheFirst({
    "cacheName": "osm-tiles-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 200,
      maxAgeSeconds: 1209600
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/\/api\/.*/i, new workbox.NetworkFirst({
    "cacheName": "api-runtime-cache",
    "networkTimeoutSeconds": 4,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 86400
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
