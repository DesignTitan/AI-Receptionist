import { AccountShell } from "./account-shell";
import "./platform.css";
import styles from "./account-frame.module.css";
export function AccountFrame({ children, eyebrow, title, description, name }: {
  children: React.ReactNode; eyebrow: string; title: string; description?: string; name?: string;
}) {
  return <AccountShell name={name}><div className={`platform ${styles.content}`}><header className="platform-heading"><p className="platform-kicker">{eyebrow}</p><h1>{title}</h1>{description && <p>{description}</p>}</header>{children}</div></AccountShell>;
}
