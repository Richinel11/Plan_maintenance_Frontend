import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X, Check } from "lucide-react";

export default function SearchableSelect({
  label,
  value,
  options = [],
  placeholder = "Sélectionner une option",
  onChange,
  hasError = false,
  icon,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const getOptionLabel = (opt) => {
    if (!opt) return "";
    if (typeof opt === "object") {
      return (
        opt.libelle ||
        opt.nom ||
        opt.valeur ||
        opt.name ||
        opt.username ||
        `${opt.first_name || ""} ${opt.last_name || ""}`.trim() ||
        `ID: ${opt.id}`
      );
    }
    return String(opt);
  };

  const getOptionId = (opt) => {
    if (!opt) return "";
    if (typeof opt === "object") return opt.id;
    return opt;
  };

  // Find the selected option and synchronize search term
  useEffect(() => {
    if (value) {
      const selectedOpt = options.find(
        (opt) => String(getOptionId(opt)) === String(value)
      );
      if (selectedOpt) {
        setSearchTerm(getOptionLabel(selectedOpt));
      }
    } else {
      setSearchTerm("");
    }
  }, [value, options]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        // Reset search term to selected value label on blur
        if (value) {
          const selectedOpt = options.find(
            (opt) => String(getOptionId(opt)) === String(value)
          );
          if (selectedOpt) {
            setSearchTerm(getOptionLabel(selectedOpt));
          }
        } else {
          setSearchTerm("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options]);

  const filteredOptions = options.filter((opt) => {
    const lbl = getOptionLabel(opt);
    return lbl.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelect = (opt) => {
    const id = getOptionId(opt);
    const lbl = getOptionLabel(opt);
    onChange(id);
    setSearchTerm(lbl);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setSearchTerm("");
  };

  const hasSelection = !!value;

  return (
    <div className="select-group" ref={wrapperRef} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 4 }}>{label}</label>}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 14px",
          background: "white",
          border: `1.5px solid ${hasError ? "#EF4444" : isOpen ? "#1B75BB" : hasSelection ? "#E2E8F0" : "#E2E8F0"}`,
          borderRadius: 10,
          boxShadow: hasError ? "0 0 0 3px #FEF2F2" : isOpen ? "0 0 0 3px #EBF5FF" : "none",
          cursor: "text",
          transition: "all 0.2s ease",
          minHeight: 46,
        }}
        onClick={() => setIsOpen(true)}
      >
        {icon ? (
          <span style={{ color: hasSelection ? "#1B75BB" : "#94A3B8", display: "flex", alignItems: "center" }}>{icon}</span>
        ) : (
          <Search size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
        )}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) handleClear();
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          style={{
            border: "none",
            outline: "none",
            flex: 1,
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            color: "#334155",
            background: "transparent",
            fontWeight: hasSelection ? 500 : 400,
          }}
        />
        {hasSelection ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
              color: "#94A3B8",
              flexShrink: 0,
            }}
            title="Effacer"
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={16} color="#94A3B8" style={{ flexShrink: 0, pointerEvents: "none" }} />
        )}

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "white",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              zIndex: 2000,
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#94A3B8",
                  fontSize: 13,
                  fontStyle: "italic",
                }}
              >
                Aucune option trouvée pour « {searchTerm} »
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const optId = getOptionId(opt);
                const optLbl = getOptionLabel(opt);
                const isSelected = String(value) === String(optId);
                return (
                  <div
                    key={optId || index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(opt);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      cursor: "pointer",
                      background: isSelected ? "#EBF5FF" : "white",
                      borderBottom: "1px solid #F1F5F9",
                      transition: "background 0.15s",
                      fontSize: 14,
                      color: isSelected ? "#1B75BB" : "#334155",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "#F8FAFC";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "white";
                    }}
                  >
                    <span>{optLbl}</span>
                    {isSelected && <Check size={14} color="#1B75BB" />}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
