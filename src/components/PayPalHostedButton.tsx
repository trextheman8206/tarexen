"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { PAYPAL } from "@/config/pricing";

type PayPalSdk = { HostedButtons: (o: { hostedButtonId: string }) => { render: (sel: string) => Promise<void> } };
declare global {
  interface Window { paypal?: PayPalSdk }
}

const SDK_URL = `https://www.paypal.com/sdk/js?client-id=${PAYPAL.clientId}&components=hosted-buttons&disable-funding=venmo&currency=USD`;

/** Botón de pago de PayPal (pago único). Si PayPal no carga, avisa en vez de quedar en blanco. */
export function PayPalHostedButton({ buttonId, failText }: { buttonId: string; failText: string }) {
  const containerId = `paypal-container-${buttonId}`;
  const rendered = useRef(false);
  const [failed, setFailed] = useState(false);

  const render = useCallback(() => {
    if (rendered.current || !window.paypal?.HostedButtons) return;
    rendered.current = true;
    window.paypal.HostedButtons({ hostedButtonId: buttonId }).render(`#${containerId}`).catch(() => setFailed(true));
  }, [buttonId, containerId]);

  useEffect(() => {
    render();
    return () => { rendered.current = false; };
  }, [render]);

  return (
    <>
      <Script src={SDK_URL} strategy="afterInteractive" onReady={render} onError={() => setFailed(true)} />
      <div id={containerId} style={{ minHeight: 48 }} />
      {failed && <p className="small muted" style={{ margin: 0 }}>{failText}</p>}
    </>
  );
}
