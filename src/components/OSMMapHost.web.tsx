import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useImperativeHandle(ref, () => ({
    post: (cmd) => {
      iframeRef.current?.contentWindow?.postMessage(cmd, '*');
    },
  }));

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!iframeRef.current) return;
      if (e.source !== iframeRef.current.contentWindow) return;
      onMessage?.(e.data as OSMMapMessage);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);

  return (
    <View style={[{ flex: 1, overflow: 'hidden' }, style]}>
      {/* @ts-expect-error - iframe is a DOM element on web */}
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="Daegu pump stations map"
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
      />
    </View>
  );
});
