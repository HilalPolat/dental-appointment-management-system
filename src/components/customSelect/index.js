import { useState, useRef, useEffect } from "react";

export default function CustomSelect({
  name,
  options = [],
  placeholder = "Bölüm seçin",
  defaultValue = "",
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const rootRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onDocDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const handleSelect = (val) => {
    setValue(val);
    setOpen(false);
    onChange?.(val);
  };

  return (
    <div
      className="custom-select message department_select"
      ref={rootRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 400,
        overflow: "visible",   
      }}
    >
     
      <div
        className="custom-select__label"
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((v) => !v);
          if (e.key === "Escape") setOpen(false);
        }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          cursor: "pointer",
          userSelect: "none",
          position: "relative",
          zIndex: 1,     
        }}
      >
        <span className={selected ? "is-selected" : ""}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="custom-select__arrow">▾</span>
      </div>

      <input type="hidden" name={name} value={value} />

      {open && (
        <ul
          className="custom-select__menu"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "100%",      
            left: 0,
            marginTop: 6,       
            width: "100%",
            zIndex: 2,         
            maxHeight: 200,
            overflowY: "auto",
            background: "#000",
            borderRadius: 8,
            padding: "4px 0",   
            boxSizing: "border-box",
          }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`custom-select__option ${
                opt.value === value ? "is-active" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(opt.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(opt.value);
                }
              }}
              role="option"
              tabIndex={0}
              style={{ padding: "8px 12px", cursor: "pointer" }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
