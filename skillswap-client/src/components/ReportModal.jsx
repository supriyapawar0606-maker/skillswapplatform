import { useState } from "react";
import { FiX, FiFlag } from "react-icons/fi";
import Button from "./Button";

const reasons = [
  "Spam or scam",
  "Harassment or abuse",
  "Inappropriate content",
  "Fake profile",
  "Other",
];

export default function ReportModal({
  name = "User",
  onClose,
}) {
  const [reason, setReason] = useState(
    reasons[0]
  );

  const [details, setDetails] =
    useState("");

  const [blockUser, setBlockUser] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    setSubmitted(true);

    console.log("Report submitted:", {
      name,
      reason,
      details,
      blockUser,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* ======================================
            Header
        ====================================== */}

        {!submitted && (
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <FiFlag
                className="text-red-500"
                size={19}
              />

              <h3 className="font-display font-bold text-lg">
                Report {name}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <FiX size={19} />
            </button>
          </div>
        )}

        {/* ======================================
            Content
        ====================================== */}

        <div className="p-5">
          {submitted ? (
            <div className="text-center py-6">
              <FiFlag
                className="mx-auto text-emerald-500 mb-3"
                size={30}
              />

              <p className="font-semibold mb-1">
                Report submitted
              </p>

              <p className="text-sm text-gray-500">
                Our team will review{" "}
                {name}'s account shortly.
              </p>

              {blockUser && (
                <p className="text-xs text-gray-400 mt-2">
                  {name} has also been blocked.
                </p>
              )}

              <Button
                className="mt-5"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Reports are reviewed
                confidentially by the
                SkillSwap safety team.
              </p>

              <form
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                {/* Reason */}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Reason
                  </label>

                  <select
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  >
                    {reasons.map((r) => (
                      <option
                        key={r}
                        value={r}
                      >
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Details */}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Additional details
                  </label>

                  <textarea
                    value={details}
                    onChange={(e) =>
                      setDetails(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Add details (optional)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                {/* Block */}

                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blockUser}
                    onChange={(e) =>
                      setBlockUser(
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 accent-red-500"
                  />

                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Block {name}
                    </p>

                    <p className="text-xs text-gray-400">
                      Prevent this user from
                      contacting you.
                    </p>
                  </div>
                </label>

                {/* Buttons */}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="danger"
                    className="flex-1"
                  >
                    Submit Report
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}