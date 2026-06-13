"use client";

import { useState } from "react";
import { StudentStatus } from "@/types/student";
import type { Student } from "@/types/student";

interface StudentStatusChangerProps {
  student: Student;
  onStatusChange: (studentId: string, newStatus: StudentStatus, reason?: string) => void;
  isLoading?: boolean;
}

export default function StudentStatusChanger({
  student,
  onStatusChange,
  isLoading = false,
}: StudentStatusChangerProps) {
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus>(student.status);
  const [reason, setReason] = useState("");

  const handleStatusChange = () => {
    if (selectedStatus !== student.status) {
      onStatusChange(student.id, selectedStatus, reason.trim() || undefined);
      setShowStatusForm(false);
      setReason("");
    }
  };

  const getStatusColor = (status: StudentStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "SUSPENDED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "GRADUATED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "EXPELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: StudentStatus) => {
    switch (status) {
      case "ACTIVE":
        return "Actif";
      case "SUSPENDED":
        return "Suspendu";
      case "GRADUATED":
        return "Diplômé";
      case "WITHDRAWN":
        return "Désisté";
      case "EXPELLED":
        return "Exclu";
      default:
        return status;
    }
  };

  const statusOptions: { value: StudentStatus; label: string; description: string }[] = [
    {
      value: StudentStatus.ACTIVE,
      label: "Actif",
      description: "Étudiant régulièrement inscrit et actif",
    },
    {
      value: StudentStatus.SUSPENDED,
      label: "Suspendu",
      description: "Étudiant temporairement suspendu",
    },
    {
      value: StudentStatus.GRADUATED,
      label: "Diplômé",
      description: "Étudiant ayant obtenu son diplôme",
    },
    {
      value: StudentStatus.WITHDRAWN,
      label: "Désisté",
      description: "Étudiant ayant abandonné ses études",
    },
    {
      value: StudentStatus.EXPELLED,
      label: "Exclu",
      description: "Étudiant exclu définitivement",
    },
    {
      value: StudentStatus.INACTIVE,
      label: "Inactif",
      description: "Étudiant inactif",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Current Status Display */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-700">Statut actuel</p>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${getStatusColor(
              student.status
            )}`}
          >
            {getStatusLabel(student.status)}
          </span>
        </div>
        <button
          onClick={() => setShowStatusForm(!showStatusForm)}
          disabled={isLoading}
          className="px-3 py-2 text-sm font-medium text-[#00365F] bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {showStatusForm ? "Annuler" : "Changer le statut"}
        </button>
      </div>

      {/* Status Change Form */}
      {showStatusForm && (
        <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50">
          <h4 className="text-sm font-medium text-zinc-900 mb-3">
            Changer le statut de l'étudiant
          </h4>

          <div className="space-y-4">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Nouveau statut</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as StudentStatus)}
                className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                disabled={isLoading}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 mt-1">
                {statusOptions.find((opt) => opt.value === selectedStatus)?.description}
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Raison du changement (optionnel)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Expliquez la raison du changement de statut..."
                rows={3}
                className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowStatusForm(false);
                  setSelectedStatus(student.status);
                  setReason("");
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleStatusChange}
                disabled={isLoading || selectedStatus === student.status}
                className="px-4 py-2 text-sm font-medium text-white bg-[#008D36] border border-transparent rounded-md hover:bg-[#007A2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Modification..." : "Changer le statut"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
