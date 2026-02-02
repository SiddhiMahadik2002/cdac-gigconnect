import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import { formatCurrency } from '../utils/nameMapper.js';
import { getMyProposals } from '../api/proposal.api.js';
import { deliverWork } from '../api/orderApi.js';
import { STATUS_PERMISSIONS, PROPOSAL_STATUS, ORDER_STATUS } from '../utils/constants.js';
import {
  getStatusDisplay,
  canRequestCompletion,
  getStatusClassName
} from '../utils/statusHelpers.js';
import styles from './ActiveProjectsPage.module.css';
import { WarningIcon, MoneyIcon, CalendarIcon, PersonIcon, NoteIcon, InfoIcon, ChatIcon } from '../components/icons/Icons.jsx';

const ActiveProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, IN_PROGRESS, COMPLETION_REQUESTED, COMPLETED
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [deliverableLinks, setDeliverableLinks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError('');

        const orders = await getMyProposals();

        // Filter for active orders using order/proposal statuses
        const activeStatuses = [
          ORDER_STATUS.CONFIRMED,
          ORDER_STATUS.IN_PROGRESS,
          ORDER_STATUS.DELIVERED,
          ORDER_STATUS.REVISION_REQUESTED,
          // Backend may return this legacy string
          'SUBMITTED_FOR_REVIEW',
          // Legacy proposal statuses (back-compat)
          PROPOSAL_STATUS.IN_PROGRESS,
          PROPOSAL_STATUS.ACCEPTED,
          PROPOSAL_STATUS.COMPLETION_REQUESTED,
          PROPOSAL_STATUS.AWAITING_COMPLETION,
          PROPOSAL_STATUS.REVISION_REQUESTED
        ];

        const activeOrders = orders.filter(order => activeStatuses.includes(order.status));

        const projectsData = activeOrders.map(order => ({
          id: order.id,
          requirementId: order.requirementId || order.gigId, // Could be from requirement or gig
          title: order.title, // Now using order title directly
          price: order.amount, // Order amount instead of proposedPrice
          status: order.status, // Order status
          startDate: order.createdAt || order.startedAt,
          message: order.description?.substring(0, 150) + '...' || 'No description available',
          clientName: order.clientName,
          completedAt: order.completedAt,
          clientFeedback: order.clientNotes, // Map clientNotes to clientFeedback
          completionNotes: order.deliveryNotes, // Map deliveryNotes to completionNotes
          rejectionReason: order.revisionNotes, // Map revisionNotes to rejectionReason
          submittedAt: order.deliveredAt, // Map deliveredAt to submittedAt
          orderType: order.orderType, // Additional order info
          orderSource: order.orderSource
        }));

        setProjects(projectsData);
      } catch (err) {
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleRequestCompletion = (project) => {
    setSelectedProject(project);
    setShowCompletionModal(true);
    setCompletionNotes('');
    setDeliverableLinks('');
  };

  const handleSubmitCompletion = async (e) => {
    e.preventDefault();

    if (!completionNotes.trim()) {
      setError('Please provide completion notes');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Use unified order API for both GIG_PURCHASE and CUSTOM_PROJECT
      const deliveryNotes = `${completionNotes.trim()}${deliverableLinks.trim() ? '\n\nDeliverable Links: ' + deliverableLinks.trim() : ''}`;

      await deliverWork(selectedProject.id, deliveryNotes);

      // Refresh projects list
      const orders = await getMyProposals(); // This now returns orders
      const activeOrders = orders.filter(order =>
        ['CONFIRMED', 'IN_PROGRESS', 'DELIVERED', 'REVISION_REQUESTED'].includes(order.status)
      );
      const projectsData = activeOrders.map(order => ({
        id: order.id,
        requirementId: order.requirementId || order.gigId,
        title: order.title,
        price: order.amount,
        status: order.status,
        startDate: order.createdAt || order.startedAt,
        message: order.description?.substring(0, 150) + '...' || 'No description available',
        clientName: order.clientName,
        completedAt: order.completedAt,
        clientFeedback: order.clientNotes,
        completionNotes: order.deliveryNotes,
        rejectionReason: order.revisionNotes,
        submittedAt: order.deliveredAt,
        orderType: order.orderType,
        orderSource: order.orderSource
      }));
      setProjects(projectsData);

      setShowCompletionModal(false);
      setSelectedProject(null);
    } catch (err) {
      setError('Failed to submit completion request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inProgressStatuses = [PROPOSAL_STATUS.IN_PROGRESS, PROPOSAL_STATUS.ACCEPTED, ORDER_STATUS.IN_PROGRESS];
  const awaitingApprovalStatuses = [PROPOSAL_STATUS.COMPLETION_REQUESTED, PROPOSAL_STATUS.AWAITING_COMPLETION, 'SUBMITTED_FOR_REVIEW', ORDER_STATUS.DELIVERED];
  const completedStatuses = [PROPOSAL_STATUS.COMPLETED, ORDER_STATUS.COMPLETED];

  const filteredProjects = filter === 'ALL'
    ? projects
    : filter === 'COMPLETION_REQUESTED'
      ? projects.filter(p => awaitingApprovalStatuses.includes(p.status))
      : filter === 'IN_PROGRESS'
        ? projects.filter(p => inProgressStatuses.includes(p.status))
        : filter === 'COMPLETED'
          ? projects.filter(p => completedStatuses.includes(p.status))
          : projects.filter(p => p.status === filter);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.projectsPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>My Active Projects</h1>
            <p className={styles.subtitle}>
              Manage and track all your ongoing projects in one place
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link to="/requirements">
              <Button variant="primary">Browse New Projects</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <span className={styles.errorIcon}><WarningIcon /></span>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filter === 'ALL' ? styles.active : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All Projects ({projects.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'IN_PROGRESS' ? styles.active : ''}`}
            onClick={() => setFilter('IN_PROGRESS')}
          >
            In Progress ({projects.filter(p => inProgressStatuses.includes(p.status)).length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'COMPLETION_REQUESTED' ? styles.active : ''}`}
            onClick={() => setFilter('COMPLETION_REQUESTED')}
          >
            Awaiting Approval ({projects.filter(p => awaitingApprovalStatuses.includes(p.status)).length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'COMPLETED' ? styles.active : ''}`}
            onClick={() => setFilter('COMPLETED')}
          >
            Completed ({projects.filter(p => completedStatuses.includes(p.status)).length})
          </button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className={styles.projectsGrid}>
            {filteredProjects.map((project) => {
              const statusInfo = getStatusDisplay(project.status);
              const canSubmitCompletion = canRequestCompletion(project.status);

              return (
                <div key={project.id} className={styles.projectCard}>
                  <div className={styles.projectHeader}>
                    <div className={styles.projectInfo}>
                      <h3 className={styles.projectTitle}>{project.title}</h3>
                      <span className={styles.projectId}>Requirement #{project.requirementId}</span>
                    </div>
                    <div className={styles.projectStatus}>
                      <span className={`${styles.statusBadge} ${styles[getStatusClassName(project.status)]}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <p className={styles.projectDescription}>{project.message}</p>

                  {/* Show revision feedback if exists */}
                  {project.status === 'REVISION_REQUESTED' && project.rejectionReason && (
                    <div className={styles.feedbackBox}>
                      <div className={styles.feedbackHeader}>
                        <span className={styles.feedbackIcon}><ChatIcon /></span>
                        <strong>Client Feedback:</strong>
                      </div>
                      <p className={styles.feedbackText}>{project.rejectionReason}</p>
                    </div>
                  )}

                  {/* Show completion status if awaiting approval */}
                  {project.status === 'COMPLETION_REQUESTED' && (
                    <div className={styles.statusBox}>
                      <div className={styles.statusBoxHeader}>
                        <span className={styles.statusBoxIcon}><InfoIcon /></span>
                        <strong>Completion Submitted</strong>
                      </div>
                      <p className={styles.statusBoxText}>
                        Your completion request is pending client approval. Submitted on{' '}
                        {new Date(project.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      {project.completionNotes && (
                        <p className={styles.notesText}><strong>Notes:</strong> {project.completionNotes}</p>
                      )}
                    </div>
                  )}

                  <div className={styles.projectMeta}>
                    <div className={styles.projectMetaItem}>
                      <span className={styles.metaIcon}><MoneyIcon /></span>
                      <div>
                        <span className={styles.metaLabel}>Project Value</span>
                        <span className={styles.metaValue}>{formatCurrency(project.price)}</span>
                      </div>
                    </div>
                    <div className={styles.projectMetaItem}>
                      <span className={styles.metaIcon}><CalendarIcon /></span>
                      <div>
                        <span className={styles.metaLabel}>Started</span>
                        <span className={styles.metaValue}>
                          {new Date(project.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={styles.projectMetaItem}>
                      <span className={styles.metaIcon}><PersonIcon /></span>
                      <div>
                        <span className={styles.metaLabel}>Client</span>
                        <span className={styles.metaValue}>{project.clientName}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.projectActions}>
                    {/* Show View Details only for CUSTOM_PROJECT orders (from client requirements) */}
                    {project.orderType === 'CUSTOM_PROJECT' && (
                      <Link to={`/requirements/${project.requirementId}`}>
                        <Button variant="primary" size="small">
                          View Details
                        </Button>
                      </Link>
                    )}

                    {/* Show Request Completion for all order types */}
                    {canSubmitCompletion && (
                      <Button
                        variant="success"
                        size="small"
                        onClick={() => handleRequestCompletion(project)}
                      >
                        ✓ {project.status === 'REVISION_REQUESTED' ? 'Resubmit' : 'Request Completion'}
                      </Button>
                    )}

                    {/* Already submitted for approval */}
                    {project.status === 'COMPLETION_REQUESTED' && (
                      <Button variant="outline" size="small" disabled>
                        <InfoIcon /> {statusInfo.label}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}><NoteIcon /></div>
            <h3 className={styles.emptyStateTitle}>No {filter !== 'ALL' ? filter.replace('_', ' ').toLowerCase() : ''} Projects</h3>
            <p className={styles.emptyStateText}>
              {filter === 'ALL'
                ? 'Start browsing requirements and submit proposals to land your first project!'
                : `You don't have any ${filter.replace('_', ' ').toLowerCase()} projects at the moment.`
              }
            </p>
            <Link to="/requirements">
              <Button variant="primary">Browse Requirements</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Completion Request Modal */}
      <Modal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        title="Request Project Completion"
      >
        <form onSubmit={handleSubmitCompletion}>
          <div className={styles.modalContent}>
            <p className={styles.modalDescription}>
              Submit your completed work for client review. The client will review your submission and either approve it or request revisions.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Completion Notes <span className={styles.required}>*</span>
              </label>
              <TextArea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Describe what you've completed, any important details, or instructions for the client..."
                rows={5}
                required
              />
              <span className={styles.hint}>Explain what you've delivered and any relevant details</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Deliverable Links (Optional)
              </label>
              <Input
                type="text"
                value={deliverableLinks}
                onChange={(e) => setDeliverableLinks(e.target.value)}
                placeholder="https://github.com/username/project or https://demo.example.com"
              />
              <span className={styles.hint}>Links to GitHub, live demo, or other deliverables</span>
            </div>

            <div className={styles.infoBox}>
              <span className={styles.infoIcon}><InfoIcon /></span>
              <div>
                <strong>What happens next?</strong>
                <p>The client will be notified and can either approve your work or request revisions. You'll be notified of their decision.</p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCompletionModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                disabled={submitting || !completionNotes.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ActiveProjectsPage;
