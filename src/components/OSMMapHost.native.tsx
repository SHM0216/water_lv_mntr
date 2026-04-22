import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export type OSMMapMessage =
  | { type: 'select'; stationId: string }
  | { type: 'ready' };

export type OSMMapCommand =
  | { type: 'levels'; levels: Record<string, number> }
  | { type: 'tile'; url: string; attribution?: string };

export type OSMMapHostRef = {
  post: (cmd: OSMMapCommand) => void;
};

type Props = {
  html: string;
  style?: StyleProp<ViewStyle>;
  onMessage?: (msg: OSMMapMessage) => void;
};

export const OSMMapHost = forwardRef<OSMMapHostRef, Props>(function OSMMapHost(
  { html, style, onMessage },
  ref,
) {
  const wv = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    post: (cmd) => {
      const serialized = JSON.stringify(cmd).replace(/</g, '\\u003c');
      wv.current?.injectJavaScript(
        `(function(){try{var d=${serialized};if(window.__osmHandle)window.__osmHandle(d);}catch(e){}})();true;`,
      );
    },
  }));

  const handle = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data) as OSMMapMessage;
      onMessage?.(msg);
    } catch {}
  };

  return (
    <WebView
      ref={wv}
      source={{ html }}
      style={style}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      onMessage={handle}
      scrollEnabled={false}
      overScrollMode="never"
      androidLayerType="hardware"
      setSupportMultipleWindows={false}
    />
  );
});
