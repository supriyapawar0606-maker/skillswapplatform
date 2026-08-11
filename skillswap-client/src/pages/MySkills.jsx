import { useState, useEffect } from "react";

import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiBookOpen,
  FiArchive,
  FiRotateCcw,
  FiX,
} from "react-icons/fi";

import Button from "../components/Button";
import { useToast } from "../components/Toast";
import API from "../api/axios";

// ==========================================
// Categories
// ==========================================

const categories = [
  "Programming",
  "Design",
  "Language",
  "Music",
  "Marketing",
  "Business",
  "Photography",
  "Cooking",
  "Fitness",
  "Other",
];

// ==========================================
// Levels
// ==========================================

const levels = [
  "Beginner",
  "Intermediate",
  "Expert",
];

// ==========================================
// Availability
// ==========================================

const availabilityOptions = [
  "Anytime",
  "Weekdays",
  "Weekends",
];

// ==========================================
// Empty Form
// ==========================================

const emptyForm = {
  title: "",
  category: "Programming",
  description: "",
  level: "Beginner",
  availability: "Anytime",
};

// ==========================================
// My Skills
// ==========================================

export default function MySkills() {
  const showToast = useToast();

  // ========================================
  // State
  // ========================================

  const [loading, setLoading] = useState(true);

  const [skills, setSkills] = useState([]);

  const [filteredSkills, setFilteredSkills] =
    useState([]);

  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedSkill, setSelectedSkill] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [archivingId, setArchivingId] =
    useState(null);

  // ========================================
  // Fetch Skills
  // ========================================

  const fetchSkills = async () => {
    try {
      setLoading(true);

      const response =
        await API.get("/skills/my-skills");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load skills"
        );
      }

      const skillData =
        response.data.skills || [];

      setSkills(skillData);
      setFilteredSkills(skillData);
    } catch (error) {
      console.error(
        "Fetch skills error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to load skills",
        "error"
      );

      setSkills([]);
      setFilteredSkills([]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Initial Load
  // ========================================

  useEffect(() => {
    fetchSkills();
  }, []);

  // ========================================
  // Search
  // ========================================

  useEffect(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      setFilteredSkills(skills);
      return;
    }

    const filtered = skills.filter(
      (skill) => {
        const title =
          skill.title
            ?.toLowerCase() || "";

        const description =
          skill.description
            ?.toLowerCase() || "";

        const category =
          skill.category
            ?.toLowerCase() || "";

        const level =
          skill.level
            ?.toLowerCase() || "";

        return (
          title.includes(keyword) ||
          description.includes(keyword) ||
          category.includes(keyword) ||
          level.includes(keyword)
        );
      }
    );

    setFilteredSkills(filtered);
  }, [search, skills]);

  // ========================================
  // Form Change
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================
  // Validate Form
  // ========================================

  const validateForm = () => {
    if (!form.title.trim()) {
      showToast(
        "Skill title is required",
        "error"
      );

      return false;
    }

    if (!form.category) {
      showToast(
        "Please select a category",
        "error"
      );

      return false;
    }

    if (!form.description.trim()) {
      showToast(
        "Skill description is required",
        "error"
      );

      return false;
    }

    return true;
  };

  // ========================================
  // Open Add Modal
  // ========================================

  const openAddModal = () => {
    setForm(emptyForm);
    setShowAddModal(true);
  };

  // ========================================
  // Close Add Modal
  // ========================================

  const closeAddModal = () => {
    if (saving) return;

    setShowAddModal(false);
    setForm(emptyForm);
  };

  // ========================================
  // Add Skill
  // ========================================

  const addSkill = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const response =
        await API.post(
          "/skills",
          form
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to add skill"
        );
      }

      showToast(
        "Skill added successfully",
        "success"
      );

      setShowAddModal(false);
      setForm(emptyForm);

      await fetchSkills();
    } catch (error) {
      console.error(
        "Add skill error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to add skill",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // Open Edit Modal
  // ========================================

  const openEditModal = (skill) => {
    setSelectedSkill(skill);

    setForm({
      title: skill.title || "",
      category:
        skill.category || "Programming",
      description:
        skill.description || "",
      level:
        skill.level || "Beginner",
      availability:
        skill.availability || "Anytime",
    });

    setShowEditModal(true);
  };

  // ========================================
  // Close Edit Modal
  // ========================================

  const closeEditModal = () => {
    if (saving) return;

    setShowEditModal(false);
    setSelectedSkill(null);
    setForm(emptyForm);
  };

  // ========================================
  // Update Skill
  // ========================================

  const updateSkill = async () => {
    if (!selectedSkill?._id) {
      showToast(
        "Skill not selected",
        "error"
      );

      return;
    }

    if (!validateForm()) return;

    try {
      setSaving(true);

      const response =
        await API.put(
          `/skills/${selectedSkill._id}`,
          form
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to update skill"
        );
      }

      showToast(
        "Skill updated successfully",
        "success"
      );

      setShowEditModal(false);
      setSelectedSkill(null);
      setForm(emptyForm);

      await fetchSkills();
    } catch (error) {
      console.error(
        "Update skill error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Unable to update skill",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // Delete Skill
  // ========================================

  const deleteSkill = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this skill?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response =
        await API.delete(
          `/skills/${id}`
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to delete skill"
        );
      }

      showToast(
        "Skill deleted successfully",
        "success"
      );

      await fetchSkills();
    } catch (error) {
      console.error(
        "Delete skill error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Unable to delete skill",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================
  // Archive / Restore Skill
  // ========================================

  const toggleArchiveSkill = async (
    skill
  ) => {
    const action =
      skill.isArchived
        ? "restore"
        : "archive";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} "${skill.title}"?`
      );

    if (!confirmed) return;

    try {
      setArchivingId(skill._id);

      const response =
        await API.put(
          `/skills/${skill._id}/archive`
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to update skill"
        );
      }

      showToast(
        skill.isArchived
          ? "Skill restored successfully"
          : "Skill archived successfully",
        "success"
      );

      await fetchSkills();
    } catch (error) {
      console.error(
        "Archive skill error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Unable to update archive status",
        "error"
      );
    } finally {
      setArchivingId(null);
    }
  };

  // ========================================
  // Refresh
  // ========================================

  const refreshSkills = async () => {
    await fetchSkills();

    showToast(
      "Skills refreshed",
      "success"
    );
  };

  // ========================================
  // Modal Form
  // ========================================

  const renderSkillForm = () => (
    <div className="space-y-4">

      {/* Title */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Skill Title
        </label>

        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="React Development"
          maxLength={100}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />

        <p className="text-xs text-gray-400 mt-1">
          {form.title.length}/100
        </p>
      </div>

      {/* Category */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Category
        </label>

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          {categories.map(
            (category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            )
          )}
        </select>
      </div>

      {/* Description */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Description
        </label>

        <textarea
          name="description"
          rows={5}
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your skill..."
          maxLength={1000}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />

        <p className="text-xs text-gray-400 mt-1">
          {form.description.length}/1000
        </p>
      </div>

      {/* Level */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Skill Level
        </label>

        <select
          name="level"
          value={form.level}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          {levels.map(
            (level) => (
              <option
                key={level}
                value={level}
              >
                {level}
              </option>
            )
          )}
        </select>
      </div>

      {/* Availability */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Availability
        </label>

        <select
          name="availability"
          value={form.availability}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          {availabilityOptions.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );

  // ========================================
  // JSX
  // ========================================

  return (
    <div className="space-y-6">

      {/* ==================================
          Header
      ================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            My Skills
          </h1>

          <p className="text-gray-500 mt-1">
            Manage the skills you want to
            teach on SkillSwap.
          </p>
        </div>

        <div className="flex gap-3">

          <Button
            variant="outline"
            onClick={refreshSkills}
            icon={FiRefreshCw}
          >
            Refresh
          </Button>

          <Button
            onClick={openAddModal}
            icon={FiPlus}
          >
            Add Skill
          </Button>

        </div>
      </div>

      {/* ==================================
          Search
      ================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 p-4">

        <div className="relative">

          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search your skills..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />

        </div>
      </div>

      {/* ==================================
          Loading
      ================================== */}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>

          <p className="text-gray-500">
            Loading skills...
          </p>

        </div>
      ) : filteredSkills.length === 0 ? (

        /* ==================================
           Empty State
        ================================== */

        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">

          <FiBookOpen
            className="mx-auto text-gray-300 mb-5"
            size={70}
          />

          <h2 className="text-2xl font-bold mb-2">
            {search
              ? "No matching skills found"
              : "No Skills Added Yet"}
          </h2>

          <p className="text-gray-500 mb-6">
            {search
              ? "Try another search keyword."
              : "Click Add Skill to create your first skill."}
          </p>

          {!search && (
            <Button
              onClick={openAddModal}
              icon={FiPlus}
            >
              Add Your First Skill
            </Button>
          )}

        </div>
      ) : (

        /* ==================================
           Skill Cards
        ================================== */

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredSkills.map(
            (skill) => (

              <div
                key={skill._id}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all ${
                  skill.isArchived
                    ? "border-yellow-300 opacity-80"
                    : "border-gray-200"
                }`}
              >

                {/* Card */}

                <div className="p-6">

                  {/* Top */}

                  <div className="flex justify-between items-start gap-3">

                    <div className="min-w-0">

                      <h2 className="text-xl font-bold truncate">
                        {skill.title}
                      </h2>

                      <div className="flex flex-wrap gap-2 mt-2">

                        <span className="text-xs px-3 py-1 rounded-full bg-brand-100 text-brand-700">
                          {skill.category}
                        </span>

                        {skill.isArchived && (
                          <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                            Archived
                          </span>
                        )}

                      </div>

                    </div>

                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                      {skill.level}
                    </span>

                  </div>

                  {/* Description */}

                  <p className="text-gray-600 mt-4 text-sm leading-6 line-clamp-4">
                    {skill.description}
                  </p>

                  {/* Bottom */}

                  <div className="mt-5">

                    <div className="flex justify-between items-center mb-4">

                      <span className="text-xs text-gray-500">
                        Availability:
                        {" "}
                        <span className="font-medium text-gray-700">
                          {skill.availability}
                        </span>
                      </span>

                    </div>

                    {/* Buttons */}

                    <div className="flex gap-2 flex-wrap">

                      {/* Edit */}

                      <Button
                        size="sm"
                        variant="outline"
                        icon={FiEdit2}
                        onClick={() =>
                          openEditModal(
                            skill
                          )
                        }
                      >
                        Edit
                      </Button>

                      {/* Archive / Restore */}

                      <Button
                        size="sm"
                        variant="outline"
                        icon={
                          skill.isArchived
                            ? FiRotateCcw
                            : FiArchive
                        }
                        disabled={
                          archivingId ===
                          skill._id
                        }
                        onClick={() =>
                          toggleArchiveSkill(
                            skill
                          )
                        }
                      >
                        {archivingId ===
                        skill._id
                          ? "..."
                          : skill.isArchived
                          ? "Restore"
                          : "Archive"}
                      </Button>

                      {/* Delete */}

                      <Button
                        size="sm"
                        variant="danger"
                        icon={FiTrash2}
                        disabled={
                          deletingId ===
                          skill._id
                        }
                        onClick={() =>
                          deleteSkill(
                            skill._id
                          )
                        }
                      >
                        {deletingId ===
                        skill._id
                          ? "..."
                          : "Delete"}
                      </Button>

                    </div>
                  </div>

                </div>
              </div>
            )
          )}

        </div>
      )}

      {/* ==================================
          Add Skill Modal
      ================================== */}

      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
          onMouseDown={closeAddModal}
        >

          <div
            className="bg-white rounded-2xl w-[600px] max-w-full p-6 max-h-[90vh] overflow-y-auto"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                Add New Skill
              </h2>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={saving}
                className="text-gray-400 hover:text-gray-700"
              >
                <FiX size={22} />
              </button>

            </div>

            {/* Form */}

            {renderSkillForm()}

            {/* Buttons */}

            <div className="flex justify-end gap-3 mt-8">

              <Button
                variant="outline"
                onClick={closeAddModal}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                onClick={addSkill}
                disabled={saving}
              >
                {saving
                  ? "Adding..."
                  : "Add Skill"}
              </Button>

            </div>

          </div>
        </div>
      )}

      {/* ==================================
          Edit Skill Modal
      ================================== */}

      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
          onMouseDown={closeEditModal}
        >

          <div
            className="bg-white rounded-2xl w-[600px] max-w-full p-6 max-h-[90vh] overflow-y-auto"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                Edit Skill
              </h2>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                className="text-gray-400 hover:text-gray-700"
              >
                <FiX size={22} />
              </button>

            </div>

            {/* Form */}

            {renderSkillForm()}

            {/* Buttons */}

            <div className="flex justify-end gap-3 mt-8">

              <Button
                variant="outline"
                onClick={closeEditModal}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                onClick={updateSkill}
                disabled={saving}
              >
                {saving
                  ? "Updating..."
                  : "Update Skill"}
              </Button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}