// 프로토타입의 Card/Btn 공용 소품을 그대로 이식 (색상·그림자 값 동일).
import { ReactNode, CSSProperties } from "react";

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={"rounded-2xl " + className}
      style={{
        background: "#FCFBF7",
        border: "1px solid #E6E1D5",
        boxShadow: "0 1px 0 rgba(0,0,0,0.02), 0 18px 40px -30px rgba(44,43,51,0.25)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  disabled,
  small,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors"
      style={{
        background: disabled ? "#DED9CD" : "#4C4CA6",
        color: disabled ? "#9C988E" : "#fff",
        border: `1px solid ${disabled ? "#DED9CD" : "#4C4CA6"}`,
        padding: small ? "8px 16px" : "13px 24px",
        fontSize: small ? 14 : 15.5,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: !disabled ? "0 6px 18px -8px rgba(76,76,166,0.55)" : "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
