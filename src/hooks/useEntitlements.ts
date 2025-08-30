import { useEffect, useState } from "react";
import { hasProEntitlement } from "../api/purchases";

export function useEntitlements() {
  const [loading, setLoading] = useState(true);
  const [hasPro, setHasPro] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const pro = await hasProEntitlement();
        if (mounted) setHasPro(pro);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  return { loading, hasPro, setHasPro };
}
