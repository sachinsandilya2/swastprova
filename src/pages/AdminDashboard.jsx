import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function AdminDashboard() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchProviders = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, "providers"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setProviders(data);
    } catch (error) {
      console.error("Error fetching providers:", error);
      alert("Providers load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);

      await updateDoc(doc(db, "providers", id), {
        status,
      });

      setProviders((prev) =>
        prev.map((provider) =>
          provider.id === id ? { ...provider, status } : provider
        )
      );

      alert(
        status === "approved"
          ? "Provider approved successfully."
          : "Provider rejected."
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Status update nahi ho paaya.");
    } finally {
      setUpdating(null);
    }
  };

  /* ================= DELETE PROVIDER ================= */

  const deleteProvider = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete ${
        name || "this provider"
      }?\n\nThis application will be deleted from the database.`
    );

    if (!confirmDelete) return;

    try {
      setUpdating(id);

      await deleteDoc(doc(db, "providers", id));

      setProviders((prev) =>
        prev.filter((provider) => provider.id !== id)
      );

      alert("Provider deleted successfully.");
    } catch (error) {
      console.error("Error deleting provider:", error);
      alert("Provider delete nahi ho paaya.");
    } finally {
      setUpdating(null);
    }
  };

  const mentors = providers.filter(
    (provider) => provider.role === "mentor"
  );

  const psychologists = providers.filter(
    (provider) => provider.role === "psychologist"
  );

  const pending = providers.filter(
    (provider) => provider.status === "pending"
  );

  const approved = providers.filter(
    (provider) => provider.status === "approved"
  );

  const rejected = providers.filter(
    (provider) => provider.status === "rejected"
  );

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        provider.name?.toLowerCase().includes(searchText) ||
        provider.email?.toLowerCase().includes(searchText) ||
        provider.specialization
          ?.toLowerCase()
          .includes(searchText);

      const matchesRole =
        filterRole === "all" ||
        provider.role === filterRole;

      const matchesStatus =
        filterStatus === "all" ||
        provider.status === filterStatus;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    providers,
    search,
    filterRole,
    filterStatus,
  ]);

  return (
    <div className="admin-page">

      {/* ================= TOP HEADER ================= */}

      <header className="admin-header">

        <div className="admin-header-inner">

          <div className="admin-brand">

            <div className="admin-logo">
              🌱
            </div>

            <div className="admin-brand-text">

              <h1>
                Swastprova Admin
              </h1>

              <p>
                Provider Management Dashboard
              </p>

            </div>

          </div>

          <button
            onClick={fetchProviders}
            disabled={loading}
            className="refresh-button"
          >

            <span
              className={
                loading
                  ? "refresh-icon spinning"
                  : "refresh-icon"
              }
            >
              ↻
            </span>

            {loading
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="admin-main">

        {/* WELCOME */}

        <div className="admin-welcome">

          <div>

            <p className="admin-label">
              Admin Panel
            </p>

            <h2>
              Provider Applications
            </h2>

            <p className="admin-description">
              Review mentor and psychologist applications
              before they become visible on Swastprova.
            </p>

          </div>


          <div className="total-applications">

            Total Applications:{" "}

            <strong>
              {providers.length}
            </strong>

          </div>

        </div>


        {/* ================= STATISTICS ================= */}

        <div className="stats-grid">

          <StatCard
            icon="👥"
            title="Total Providers"
            value={providers.length}
            description="All applications"
          />

          <StatCard
            icon="🎓"
            title="Mentors"
            value={mentors.length}
            description="Mentor applications"
          />

          <StatCard
            icon="🧠"
            title="Psychologists"
            value={psychologists.length}
            description="Professional applications"
          />

          <StatCard
            icon="⏳"
            title="Pending"
            value={pending.length}
            description="Waiting for review"
            highlight
          />

          <StatCard
            icon="✓"
            title="Approved"
            value={approved.length}
            description="Active providers"
          />

        </div>


        {/* ================= FILTER ================= */}

        <div className="filter-panel">

          <div className="filter-row">

            {/* SEARCH */}

            <div className="search-wrapper">

              <span className="search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by name, email or specialization..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="search-input"
              />

            </div>


            {/* ROLE */}

            <select
              value={filterRole}
              onChange={(e) =>
                setFilterRole(e.target.value)
              }
              className="filter-select"
            >

              <option value="all">
                All Roles
              </option>

              <option value="mentor">
                Mentors
              </option>

              <option value="psychologist">
                Psychologists
              </option>

            </select>


            {/* STATUS */}

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value)
              }
              className="filter-select"
            >

              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>

            </select>

          </div>


          <div className="showing-count">

            Showing{" "}

            <strong>
              {filteredProviders.length}
            </strong>{" "}

            application
            {filteredProviders.length !== 1
              ? "s"
              : ""}

          </div>

        </div>


        {/* ================= APPLICATION LIST ================= */}

        <div className="application-list">

          {loading ? (

            <LoadingState />

          ) : filteredProviders.length === 0 ? (

            <EmptyState />

          ) : (

            filteredProviders.map((provider) => (

              <ProviderCard
                key={provider.id}
                provider={provider}
                updating={updating}
                updateStatus={updateStatus}
                deleteProvider={deleteProvider}
              />

            ))

          )}

        </div>


        {/* FOOTER */}

        {!loading &&
          filteredProviders.length > 0 && (

            <div className="admin-footer">

              End of applications

            </div>

          )}

      </main>


      {/* ================= RESPONSIVE CSS ================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }


        .admin-page {
          width: 100%;
          min-height: 100vh;

          background: #f8fafc;

          color: #0f172a;

          overflow-x: hidden;
        }


        /* ================= HEADER ================= */

        .admin-header {
          width: 100%;

          background: #ffffff;

          border-bottom:
            1px solid #e2e8f0;

          position: sticky;
          top: 0;

          z-index: 30;
        }


        .admin-header-inner {
          width: 100%;
          max-width: 1280px;

          margin: 0 auto;

          padding:
            16px 32px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;
        }


        .admin-brand {
          display: flex;

          align-items: center;

          gap: 12px;

          min-width: 0;
        }


        .admin-logo {
          width: 50px;
          height: 50px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          font-size: 24px;

          box-shadow:
            0 8px 20px
            rgba(37,99,235,0.18);
        }


        .admin-brand-text {
          min-width: 0;
        }


        .admin-brand-text h1 {
          margin: 0;

          color: #0f172a;

          font-size: 23px;

          font-weight: 900;

          line-height: 1.2;

          word-break: normal;
          overflow-wrap: normal;
        }


        .admin-brand-text p {
          margin: 3px 0 0;

          color: #64748b;

          font-size: 13px;

          line-height: 1.4;
        }


        /* REFRESH */

        .refresh-button {
          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 8px;

          padding:
            12px 20px;

          border: none;

          border-radius: 12px;

          background: #0f172a;

          color: white;

          font-family: inherit;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          transition: 0.2s ease;
        }


        .refresh-button:hover {
          background: #1e293b;
        }


        .refresh-button:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }


        .refresh-icon {
          font-size: 20px;
          line-height: 1;
        }


        .spinning {
          animation:
            spin 0.8s linear infinite;
        }


        /* ================= MAIN ================= */

        .admin-main {
          width: 100%;
          max-width: 1280px;

          margin: 0 auto;

          padding:
            35px 32px 60px;
        }


        /* WELCOME */

        .admin-welcome {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 20px;

          margin-bottom: 30px;
        }


        .admin-label {
          margin: 0;

          color: #2563eb;

          font-size: 12px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 1.5px;
        }


        .admin-welcome h2 {
          margin: 5px 0 0;

          color: #0f172a;

          font-size: 38px;

          line-height: 1.15;

          font-weight: 900;

          word-break: normal;
          overflow-wrap: normal;
        }


        .admin-description {
          max-width: 650px;

          margin: 8px 0 0;

          color: #64748b;

          font-size: 15px;

          line-height: 1.6;
        }


        .total-applications {
          flex-shrink: 0;

          color: #64748b;

          font-size: 13px;

          white-space: nowrap;
        }


        .total-applications strong {
          color: #0f172a;

          font-size: 16px;
        }


        /* ================= STATS ================= */

        .stats-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(
              5,
              minmax(0, 1fr)
            );

          gap: 15px;

          margin-bottom: 25px;
        }


        .stat-card {
          min-width: 0;

          background: #ffffff;

          border: 1px solid #e2e8f0;

          border-radius: 18px;

          padding: 18px;

          box-shadow:
            0 2px 8px
            rgba(15,23,42,0.03);

          transition: 0.2s ease;
        }


        .stat-card:hover {
          transform: translateY(-2px);

          box-shadow:
            0 8px 25px
            rgba(15,23,42,0.08);
        }


        .stat-card.highlight {
          border-color: #fde68a;
        }


        .stat-top {
          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        .stat-icon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: #f1f5f9;

          font-size: 20px;
        }


        .pulse-dot {
          width: 9px;
          height: 9px;

          border-radius: 50%;

          background: #facc15;

          animation:
            pulse 1.5s infinite;
        }


        .stat-title {
          margin: 13px 0 0;

          color: #64748b;

          font-size: 12px;
        }


        .stat-value {
          margin: 2px 0 0;

          color: #0f172a;

          font-size: 29px;

          line-height: 1.2;

          font-weight: 900;
        }


        .stat-description {
          margin: 3px 0 0;

          color: #94a3b8;

          font-size: 11px;

          line-height: 1.4;
        }


        /* ================= FILTER ================= */

        .filter-panel {
          width: 100%;

          padding: 20px;

          margin-bottom: 22px;

          background: #ffffff;

          border:
            1px solid #e2e8f0;

          border-radius: 20px;

          box-shadow:
            0 2px 8px
            rgba(15,23,42,0.03);
        }


        .filter-row {
          display: flex;

          gap: 12px;

          width: 100%;
        }


        .search-wrapper {
          position: relative;

          flex: 1;

          min-width: 0;
        }


        .search-icon {
          position: absolute;

          left: 14px;
          top: 50%;

          transform:
            translateY(-50%);

          color: #94a3b8;

          font-size: 16px;
        }


        .search-input {
          width: 100%;
          min-width: 0;

          padding:
            13px 15px 13px 42px;

          border:
            1px solid #e2e8f0;

          border-radius: 11px;

          background: #f8fafc;

          color: #0f172a;

          font-family: inherit;

          font-size: 14px;

          outline: none;

          transition: 0.2s ease;
        }


        .search-input:focus {
          background: #ffffff;

          border-color: #3b82f6;

          box-shadow:
            0 0 0 3px
            rgba(59,130,246,0.1);
        }


        .filter-select {
          width: 180px;

          flex-shrink: 0;

          padding:
            13px 14px;

          border:
            1px solid #e2e8f0;

          border-radius: 11px;

          background: #f8fafc;

          color: #334155;

          font-family: inherit;

          font-size: 14px;

          outline: none;

          cursor: pointer;
        }


        .filter-select:focus {
          border-color: #3b82f6;
        }


        .showing-count {
          margin-top: 13px;

          color: #64748b;

          font-size: 12px;
        }


        .showing-count strong {
          color: #334155;
        }


        /* ================= APPLICATIONS ================= */

        .application-list {
          width: 100%;

          display: flex;

          flex-direction: column;

          gap: 17px;
        }


        .provider-card {
          width: 100%;

          background: #ffffff;

          border:
            1px solid #e2e8f0;

          border-radius: 22px;

          overflow: hidden;

          box-shadow:
            0 2px 10px
            rgba(15,23,42,0.04);

          transition: 0.2s ease;
        }


        .provider-card:hover {
          box-shadow:
            0 10px 30px
            rgba(15,23,42,0.08);
        }


        .status-line {
          width: 100%;
          height: 5px;
        }


        .status-line.approved {
          background: #22c55e;
        }


        .status-line.rejected {
          background: #ef4444;
        }


        .status-line.pending {
          background: #facc15;
        }


        .provider-content {
          width: 100%;

          padding: 24px;
        }


        .provider-layout {
          display: flex;

          align-items: flex-start;

          gap: 25px;
        }


        .provider-profile {
          flex: 1;
          min-width: 0;
        }


        .profile-header {
          display: flex;

          align-items: flex-start;

          gap: 13px;
        }


        .provider-avatar {
          width: 54px;
          height: 54px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;

          font-size: 23px;
        }


        .provider-avatar.mentor {
          background: #dbeafe;
        }


        .provider-avatar.psychologist {
          background: #ede9fe;
        }


        .profile-info {
          min-width: 0;
          flex: 1;
        }


        .provider-name-row {
          display: flex;

          align-items: center;

          flex-wrap: wrap;

          gap: 7px;
        }


        .provider-name {
          margin: 0;

          color: #0f172a;

          font-size: 19px;

          font-weight: 900;

          line-height: 1.3;

          word-break: break-word;
        }


        .provider-email {
          margin: 4px 0 0;

          color: #64748b;

          font-size: 13px;

          line-height: 1.5;

          word-break: break-all;
        }


        /* BADGES */

        .badge {
          display: inline-flex;

          align-items: center;

          padding:
            4px 9px;

          border-radius: 999px;

          font-size: 10px;

          font-weight: 800;

          white-space: nowrap;
        }


        .role-mentor {
          background: #dbeafe;
          color: #1d4ed8;
        }


        .role-psychologist {
          background: #ede9fe;
          color: #6d28d9;
        }


        .status-approved {
          background: #dcfce7;
          color: #15803d;
        }


        .status-rejected {
          background: #fee2e2;
          color: #b91c1c;
        }


        .status-pending {
          background: #fef3c7;
          color: #a16207;
        }


        /* DETAILS */

        .info-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 10px;

          margin-top: 20px;
        }


        .info-item {
          min-width: 0;

          padding: 11px;

          border:
            1px solid #f1f5f9;

          border-radius: 12px;

          background: #f8fafc;
        }


        .info-label {
          display: flex;

          align-items: center;

          gap: 5px;

          color: #94a3b8;

          font-size: 9px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.4px;
        }


        .info-value {
          margin: 4px 0 0;

          color: #475569;

          font-size: 12px;

          font-weight: 700;

          line-height: 1.4;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }


        /* BIO */

        .provider-bio {
          margin-top: 15px;

          padding: 14px;

          border:
            1px solid #f1f5f9;

          border-radius: 14px;

          background: #f8fafc;
        }


        .bio-label {
          margin: 0 0 5px;

          color: #94a3b8;

          font-size: 9px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 1px;
        }


        .bio-text {
          margin: 0;

          color: #64748b;

          font-size: 12px;

          line-height: 1.6;

          word-break: normal;
          overflow-wrap: anywhere;
        }


        /* ACTIONS */

        .provider-actions {
          width: 180px;

          flex-shrink: 0;
        }


        .review-label {
          margin: 0 0 10px;

          color: #94a3b8;

          font-size: 10px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.8px;
        }


        .action-buttons {
          display: flex;

          flex-direction: column;

          gap: 8px;
        }


        .approve-button,
        .reject-button,
        .delete-button {
          width: 100%;

          padding:
            11px 15px;

          border-radius: 10px;

          font-family: inherit;

          font-size: 12px;

          font-weight: 800;

          cursor: pointer;

          transition: 0.2s ease;
        }


        .approve-button {
          border: none;

          background: #16a34a;

          color: white;
        }


        .approve-button:hover {
          background: #15803d;
        }


        .reject-button {
          border:
            1px solid #fecaca;

          background: white;

          color: #dc2626;
        }


        .reject-button:hover {
          background: #fef2f2;
        }


        /* DELETE */

        .delete-button {
          border:
            1px solid #fecaca;

          background: #fff1f2;

          color: #dc2626;
        }


        .delete-button:hover {
          background: #fee2e2;
        }


        .approve-button:disabled,
        .reject-button:disabled,
        .delete-button:disabled {
          opacity: 0.4;

          cursor: not-allowed;
        }


        /* EMPTY / LOADING */

        .state-card {
          width: 100%;

          padding: 55px 25px;

          text-align: center;

          background: #ffffff;

          border:
            1px solid #e2e8f0;

          border-radius: 22px;
        }


        .state-icon {
          width: 60px;
          height: 60px;

          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 17px;

          background: #f1f5f9;

          font-size: 28px;
        }


        .loading-spinner {
          width: 44px;
          height: 44px;

          margin: 0 auto;

          border:
            4px solid #dbeafe;

          border-top-color:
            #2563eb;

          border-radius: 50%;

          animation:
            spin 0.8s linear infinite;
        }


        .state-card h3 {
          margin: 15px 0 0;

          color: #334155;

          font-size: 18px;

          font-weight: 800;
        }


        .state-card p {
          margin: 6px 0 0;

          color: #64748b;

          font-size: 13px;

          line-height: 1.5;
        }


        .admin-footer {
          padding: 30px 0;

          text-align: center;

          color: #94a3b8;

          font-size: 12px;
        }


        /* ================= ANIMATIONS ================= */

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }


        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: 0.4;
            transform: scale(0.8);
          }
        }


        /* ================= TABLET ================= */

        @media (max-width: 1100px) {

          .stats-grid {
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
          }


          .provider-layout {
            flex-direction: column;
          }


          .provider-actions {
            width: 100%;
          }


          .action-buttons {
            flex-direction: row;
          }


          .approve-button,
          .reject-button,
          .delete-button {
            flex: 1;
          }

        }


        /* ================= MOBILE ================= */

        @media (max-width: 768px) {

          .admin-header-inner {
            padding:
              13px 15px;

            align-items: center;
          }


          .admin-logo {
            width: 43px;
            height: 43px;

            border-radius: 13px;

            font-size: 21px;
          }


          .admin-brand-text h1 {
            font-size: 18px;
          }


          .admin-brand-text p {
            font-size: 11px;
          }


          .refresh-button {
            padding:
              10px 13px;

            font-size: 12px;
          }


          .admin-main {
            padding:
              25px 15px 45px;
          }


          .admin-welcome {
            flex-direction: column;

            align-items: flex-start;

            gap: 10px;

            margin-bottom: 22px;
          }


          .admin-welcome h2 {
            font-size: 29px;
          }


          .admin-description {
            font-size: 13px;
          }


          .total-applications {
            white-space: normal;
          }


          .stats-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap: 10px;
          }


          .stat-card {
            padding: 15px;
          }


          .filter-row {
            flex-direction: column;
          }


          .filter-select {
            width: 100%;
          }


          .provider-content {
            padding: 18px 15px;
          }


          .provider-layout {
            gap: 18px;
          }


          .info-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }


          .provider-actions {
            width: 100%;
          }

        }


        /* ================= SMALL PHONE ================= */

        @media (max-width: 480px) {

          .admin-header-inner {
            padding:
              11px 10px;

            gap: 8px;
          }


          .admin-logo {
            width: 39px;
            height: 39px;

            font-size: 19px;
          }


          .admin-brand-text h1 {
            font-size: 16px;
          }


          .admin-brand-text p {
            display: none;
          }


          .refresh-button {
            padding:
              9px 11px;

            border-radius: 10px;

            font-size: 11px;
          }


          .refresh-icon {
            font-size: 17px;
          }


          .admin-main {
            padding:
              20px 10px 40px;
          }


          .admin-label {
            font-size: 10px;
          }


          .admin-welcome h2 {
            font-size: 25px;

            line-height: 1.2;
          }


          .admin-description {
            font-size: 12px;
          }


          .stats-grid {
            grid-template-columns: 1fr;
          }


          .stat-card {
            padding: 14px;

            border-radius: 15px;
          }


          .stat-icon {
            width: 38px;
            height: 38px;

            font-size: 18px;
          }


          .stat-value {
            font-size: 25px;
          }


          .filter-panel {
            padding: 14px;

            border-radius: 16px;
          }


          .search-input,
          .filter-select {
            font-size: 13px;

            padding-top: 12px;
            padding-bottom: 12px;
          }


          .provider-card {
            border-radius: 18px;
          }


          .provider-content {
            padding:
              17px 12px;
          }


          .profile-header {
            gap: 10px;
          }


          .provider-avatar {
            width: 45px;
            height: 45px;

            border-radius: 13px;

            font-size: 19px;
          }


          .provider-name {
            font-size: 16px;
          }


          .provider-email {
            font-size: 11px;
          }


          .badge {
            padding:
              3px 7px;

            font-size: 9px;
          }


          .info-grid {
            grid-template-columns: 1fr;

            gap: 8px;

            margin-top: 15px;
          }


          .info-item {
            padding: 10px;
          }


          .provider-bio {
            padding: 12px;
          }


          .action-buttons {
            flex-direction: column;
          }


          .approve-button,
          .reject-button,
          .delete-button {
            width: 100%;

            flex: none;

            padding:
              11px 12px;
          }


          .state-card {
            padding:
              40px 15px;
          }

        }


        /* ================= VERY SMALL PHONE ================= */

        @media (max-width: 360px) {

          .admin-main {
            padding-left: 7px;
            padding-right: 7px;
          }


          .admin-brand-text h1 {
            font-size: 15px;
          }


          .refresh-button {
            padding:
              8px 9px;

            font-size: 10px;
          }


          .admin-welcome h2 {
            font-size: 23px;
          }


          .provider-name {
            font-size: 15px;
          }

        }

      `}</style>

    </div>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  title,
  value,
  description,
  highlight,
}) {
  return (
    <div
      className={`stat-card ${
        highlight ? "highlight" : ""
      }`}
    >

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        {highlight && (
          <span className="pulse-dot"></span>
        )}

      </div>


      <p className="stat-title">
        {title}
      </p>

      <h3 className="stat-value">
        {value}
      </h3>

      <p className="stat-description">
        {description}
      </p>

    </div>
  );
}


/* =====================================================
   PROVIDER CARD
===================================================== */

function ProviderCard({
  provider,
  updating,
  updateStatus,
  deleteProvider,
}) {
  const isMentor =
    provider.role === "mentor";

  const isApproved =
    provider.status === "approved";

  const isRejected =
    provider.status === "rejected";

  const isUpdating =
    updating === provider.id;

  return (
    <div className="provider-card">

      {/* STATUS LINE */}

      <div
        className={`status-line ${
          isApproved
            ? "approved"
            : isRejected
            ? "rejected"
            : "pending"
        }`}
      ></div>


      <div className="provider-content">

        <div className="provider-layout">

          {/* ================= PROFILE ================= */}

          <div className="provider-profile">

            <div className="profile-header">

              <div
                className={`provider-avatar ${
                  isMentor
                    ? "mentor"
                    : "psychologist"
                }`}
              >
                {isMentor
                  ? "🎓"
                  : "🧠"}
              </div>


              <div className="profile-info">

                <div className="provider-name-row">

                  <h3 className="provider-name">
                    {provider.name ||
                      "Unnamed Provider"}
                  </h3>

                  <RoleBadge
                    role={provider.role}
                  />

                  <StatusBadge
                    status={provider.status}
                  />

                </div>


                <p className="provider-email">
                  {provider.email ||
                    "No email provided"}
                </p>

              </div>

            </div>


            {/* DETAILS */}

            <div className="info-grid">

              <InfoItem
                icon="📱"
                label="Phone"
                value={
                  provider.phone ||
                  "Not provided"
                }
              />


              <InfoItem
                icon="🎯"
                label="Specialization"
                value={
                  provider.specialization ||
                  "Not provided"
                }
              />


              <InfoItem
                icon="💼"
                label="Experience"
                value={
                  provider.experience ||
                  "Not provided"
                }
              />


              {provider.qualification && (
                <InfoItem
                  icon="📜"
                  label="Qualification"
                  value={
                    provider.qualification
                  }
                />
              )}

            </div>


            {/* BIO */}

            {provider.bio && (
              <div className="provider-bio">

                <p className="bio-label">
                  About Provider
                </p>

                <p className="bio-text">
                  {provider.bio}
                </p>

              </div>
            )}

          </div>


          {/* ================= ACTIONS ================= */}

          <div className="provider-actions">

            <p className="review-label">
              Review Application
            </p>


            <div className="action-buttons">

              {/* APPROVE */}

              <button
                onClick={() =>
                  updateStatus(
                    provider.id,
                    "approved"
                  )
                }
                disabled={
                  isUpdating ||
                  isApproved
                }
                className="approve-button"
              >

                {isUpdating
                  ? "Updating..."
                  : isApproved
                  ? "✓ Approved"
                  : "✓ Approve"}

              </button>


              {/* REJECT */}

              <button
                onClick={() =>
                  updateStatus(
                    provider.id,
                    "rejected"
                  )
                }
                disabled={
                  isUpdating ||
                  isRejected
                }
                className="reject-button"
              >

                {isRejected
                  ? "✕ Rejected"
                  : "✕ Reject"}

              </button>


              {/* DELETE */}

              <button
                onClick={() =>
                  deleteProvider(
                    provider.id,
                    provider.name ||
                      "this provider"
                  )
                }
                disabled={isUpdating}
                className="delete-button"
              >

                {isUpdating
                  ? "Deleting..."
                  : "🗑️ Delete"}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   ROLE BADGE
===================================================== */

function RoleBadge({ role }) {
  return (
    <span
      className={`badge ${
        role === "mentor"
          ? "role-mentor"
          : "role-psychologist"
      }`}
    >
      {role === "mentor"
        ? "Mentor"
        : "Psychologist"}
    </span>
  );
}


/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({ status }) {
  const config = {
    approved: {
      text: "Approved",
      className: "status-approved",
      icon: "✓",
    },

    rejected: {
      text: "Rejected",
      className: "status-rejected",
      icon: "✕",
    },

    pending: {
      text: "Pending",
      className: "status-pending",
      icon: "●",
    },
  };

  const current =
    config[status] ||
    config.pending;

  return (
    <span
      className={`badge ${current.className}`}
    >
      {current.icon}{" "}
      {current.text}
    </span>
  );
}


/* =====================================================
   INFO ITEM
===================================================== */

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="info-item">

      <div className="info-label">

        <span>
          {icon}
        </span>

        <span>
          {label}
        </span>

      </div>


      <p className="info-value">
        {value}
      </p>

    </div>
  );
}


/* =====================================================
   LOADING STATE
===================================================== */

function LoadingState() {
  return (
    <div className="state-card">

      <div className="loading-spinner"></div>

      <h3>
        Loading applications
      </h3>

      <p>
        Please wait while we fetch provider
        applications.
      </p>

    </div>
  );
}


/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState() {
  return (
    <div className="state-card">

      <div className="state-icon">
        🔍
      </div>

      <h3>
        No applications found
      </h3>

      <p>
        Try changing your search or filters.
      </p>

    </div>
  );
}