import { useId, useState, type ChangeEvent } from "react";
import { Eye, EyeSlash } from "react-bootstrap-icons";

type PasswordFieldProps = {
	id?: string;
	name?: string;
	value: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	required?: boolean;
	autoComplete?: string;
	className?: string;
	inputClassName?: string;
	inputStyle?: React.CSSProperties;
};

export default function PasswordField({
	id: idProp,
	name,
	value,
	onChange,
	placeholder,
	required,
	autoComplete = "current-password",
	className,
	inputClassName = "form-control",
	inputStyle,
}: PasswordFieldProps) {
	const reactId = useId();
	const id = idProp ?? `password-${reactId}`;
	const [visible, setVisible] = useState(false);
	const toggleId = `${id}-toggle`;

	return (
		<div className={`password-field-wrap ${className ?? ""}`.trim()}>
			<input
				type={visible ? "text" : "password"}
				id={id}
				name={name}
				className={inputClassName}
				style={inputStyle}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				required={required}
				autoComplete={autoComplete}
			/>
			<button
				id={toggleId}
				type="button"
				className="password-toggle-btn"
				onClick={() => setVisible((v) => !v)}
				aria-label={visible ? "Hide password" : "Show password"}
				aria-pressed={visible}
			>
				{visible ? <EyeSlash size={18} /> : <Eye size={18} />}
			</button>
		</div>
	);
}
