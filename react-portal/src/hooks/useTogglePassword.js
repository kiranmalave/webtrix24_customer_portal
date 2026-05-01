import { useState } from 'react';

export function useTogglePassword() {
  const [show, setShow] = useState(false);
  const toggle = () => setShow((v) => !v);
  const type = show ? 'text' : 'password';
  return { show, toggle, type };
}
