// CreatePlanningModal.jsx
import React, { useState, useEffect } from "react";
import { createPlanning } from "../../../../services/planningService";
import { getEntites } from "../../../../services/userService";
import { toast } from "sonner";

const CreatePlanningModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: "",
    entite_metier_id: "",
    code: "",
  });

  const [entites, setEntites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchEntites = async () => {
      setLoading(true);
      try {
        const data = await getEntites();
        const results = Array.isArray(data) ? data : (data?.results || []);
        
        console.log("Entites received from backend:", results); // ← Debug
        setEntites(results);
      } catch (err) {
        console.error("Error loading entites:", err);
        toast.error("Impossible de charger les entités métier");
      } finally {
        setLoading(false);
      }
    };

    fetchEntites();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateCode = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const year = now.getFullYear();
    return `PLAN-${month}-${day}-${year}`;
  };

// CreatePlanningModal.jsx

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) return toast.error("Nom du planning obligatoire");
    if (!formData.entite_metier_id) return toast.error("Veuillez sélectionner une entité");

    // Retrieve your logged-in user's ID. 
    // If your Utilisateur model uses UUIDs, make sure this is a string UUID!
    const currentUserId = localStorage.getItem("userId") || "your-logged-in-user-uuid-here"; 

    setSubmitting(true);
    try {
      const payload = {
        nom: formData.nom.trim(),
        entite_metier: formData.entite_metier_id, // 👈 Remplacez entite_metier_id par entite_metier si votre serializer l'attend ainsi
        cree_par: currentUserId,                 // 👈 Obligatoire selon votre modèle Django
        ...(formData.code?.trim() && { code: formData.code.trim() }),
      };

      console.log("Payload sent to createPlanning:", payload); // Debug tool

      const response = await createPlanning(payload);
      toast.success("Planning créé avec succès !");
      onSuccess?.(response.data);
      onClose();
      setFormData({ nom: "", entite_metier_id: "", code: "" });
    } catch (error) {
      const msg = error?.response?.data 
        ? JSON.stringify(error.response.data) 
        : error.message;
      toast.error("Erreur : " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ maxWidth: "520px" }}>
        <div className="modal-header">
          <h2>Créer un nouveau Planning</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Nom du Planning *</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Maintenance Postes HTA - Juin 2026"
              required
            />
          </div>

          <div className="form-group">
            <label>Service / Entité Métier *</label>
            <select
              name="entite_metier_id"
              value={formData.entite_metier_id}
              onChange={handleChange}
              required
              disabled={loading}
              style={{ padding: "12px 16px", borderRadius: "8px", width: "100%" }}
            >
              <option value="">Sélectionner un service...</option>
              {entites.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name} {ent.type ? `(${ent.type})` : ""}
                </option>
              ))}
            </select>

            {entites.length === 0 && !loading && (
              <small style={{ color: "#f59e0b" }}>
                Aucune entité trouvée. Créez-en dans l'administration Django.
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Code (optionnel)</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="PLAN-06-24-2026"
                style={{ flex: 1 }}
              />
              <button type="button" onClick={() => setFormData(p => ({ ...p, code: generateCode() }))} className="btn-secondary">
                Générer
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Annuler</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Création..." : "Créer le Planning"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanningModal;