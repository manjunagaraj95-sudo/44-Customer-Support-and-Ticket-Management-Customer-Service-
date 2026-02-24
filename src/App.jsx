
import React, { useState, useEffect } from 'react';
// import './App.css'; // This would be imported if not in the same file block

// --- Constants and Dummy Data ---

// RBAC Roles
const ROLES = {
    CUSTOMER: 'CUSTOMER',
    SUPPORT_AGENT: 'SUPPORT_AGENT',
    SUPPORT_MANAGER: 'SUPPORT_MANAGER',
    TECHNICAL_TEAM: 'TECHNICAL_TEAM',
    ADMIN: 'ADMIN',
};

// Standardized Status Keys and UI Labels
const STATUS_MAP = {
    NEW: { label: 'New', color: 'var(--status-new)' },
    OPEN: { label: 'Open', color: 'var(--status-open)' },
    IN_PROGRESS: { label: 'In Progress', color: 'var(--status-in-progress)' },
    PENDING_CUSTOMER: { label: 'Pending Customer', color: 'var(--status-pending-customer)' },
    RESOLVED: { label: 'Resolved', color: 'var(--status-resolved)' },
    CLOSED: { label: 'Closed', color: 'var(--status-closed)' },
    ESCALATED: { label: 'Escalated', color: 'var(--status-escalated)' },
    REJECTED: { label: 'Rejected', color: 'var(--status-rejected)' },
    APPROVED: { label: 'Approved', color: 'var(--status-approved)' },
};

// Dummy Data
const DUMMY_CUSTOMERS = [
    { id: 'CUST001', name: 'Acme Corp', email: 'support@acmecorp.com' },
    { id: 'CUST002', name: 'Globex Inc', email: 'contact@globex.net' },
    { id: 'CUST003', name: 'Soylent Corp', email: 'help@soylent.co' },
];

const DUMMY_AGENTS = [
    { id: 'AGENT001', name: 'Alice Smith', email: 'alice.smith@example.com', role: ROLES.SUPPORT_AGENT },
    { id: 'AGENT002', name: 'Bob Johnson', email: 'bob.j@example.com', role: ROLES.SUPPORT_AGENT },
    { id: 'AGENT003', name: 'Charlie Brown', email: 'charlie.b@example.com', role: ROLES.SUPPORT_MANAGER },
];

const DUMMY_TICKETS = [
    {
        id: 'TKT001',
        title: 'Unable to login to portal',
        description: 'Customer is reporting issues logging into their account portal. Credentials seem correct.',
        status: 'OPEN',
        priority: 'High',
        createdAt: '2023-10-26T10:00:00Z',
        updatedAt: '2023-10-26T10:30:00Z',
        customer: DUMMY_CUSTOMERS[0],
        assignedTo: DUMMY_AGENTS[0],
        category: 'Account Access',
        attachments: [],
        workflowStages: ['NEW', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        currentWorkflowStage: 'OPEN',
        auditLog: [
            { timestamp: '2023-10-26T10:00:00Z', user: 'System', action: 'Ticket Created' },
            { timestamp: '2023-10-26T10:05:00Z', user: 'System', action: 'Assigned to Alice Smith' },
            { timestamp: '2023-10-26T10:30:00Z', user: 'Agent Alice Smith', action: 'Status changed to OPEN' },
        ],
    },
    {
        id: 'TKT002',
        title: 'Report Generation Failure',
        description: 'Monthly sales report is not generating, showing a database connection error.',
        status: 'IN_PROGRESS',
        priority: 'Critical',
        createdAt: '2023-10-25T14:15:00Z',
        updatedAt: '2023-10-26T09:00:00Z',
        customer: DUMMY_CUSTOMERS[1],
        assignedTo: DUMMY_AGENTS[1],
        category: 'Technical Issue',
        attachments: [{ name: 'error_log.txt', url: '/files/error_log.txt' }],
        workflowStages: ['NEW', 'OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED'],
        currentWorkflowStage: 'IN_PROGRESS',
        auditLog: [
            { timestamp: '2023-10-25T14:15:00Z', user: 'System', action: 'Ticket Created' },
            { timestamp: '2023-10-25T14:20:00Z', user: 'System', action: 'Assigned to Bob Johnson' },
            { timestamp: '2023-10-26T09:00:00Z', user: 'Agent Bob Johnson', action: 'Status changed to IN_PROGRESS' },
        ],
    },
    {
        id: 'TKT003',
        title: 'Feature Request: Dark Mode',
        description: 'Customer requested a dark mode option for the application UI.',
        status: 'NEW',
        priority: 'Low',
        createdAt: '2023-10-26T11:45:00Z',
        updatedAt: '2023-10-26T11:45:00Z',
        customer: DUMMY_CUSTOMERS[2],
        assignedTo: null,
        category: 'Feature Request',
        attachments: [],
        workflowStages: ['NEW', 'APPROVED', 'IN_PROGRESS', 'CLOSED'],
        currentWorkflowStage: 'NEW',
        auditLog: [
            { timestamp: '2023-10-26T11:45:00Z', user: 'System', action: 'Ticket Created' },
        ],
    },
    {
        id: 'TKT004',
        title: 'Billing Inquiry - Incorrect Charge',
        description: 'Customer believes they were overcharged for last month\'s subscription.',
        status: 'PENDING_CUSTOMER',
        priority: 'Medium',
        createdAt: '2023-10-24T09:00:00Z',
        updatedAt: '2023-10-25T16:00:00Z',
        customer: DUMMY_CUSTOMERS[0],
        assignedTo: DUMMY_AGENTS[0],
        category: 'Billing',
        attachments: [],
        workflowStages: ['NEW', 'OPEN', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED'],
        currentWorkflowStage: 'PENDING_CUSTOMER',
        auditLog: [
            { timestamp: '2023-10-24T09:00:00Z', user: 'System', action: 'Ticket Created' },
            { timestamp: '2023-10-24T09:10:00Z', user: 'System', action: 'Assigned to Alice Smith' },
            { timestamp: '2023-10-25T16:00:00Z', user: 'Agent Alice Smith', action: 'Status changed to PENDING_CUSTOMER' },
        ],
    },
    {
        id: 'TKT005',
        title: 'Email Notifications Not Working',
        description: 'Users are not receiving email notifications for updates on their tickets.',
        status: 'ESCALATED',
        priority: 'Critical',
        createdAt: '2023-10-23T13:00:00Z',
        updatedAt: '2023-10-26T14:00:00Z',
        customer: DUMMY_CUSTOMERS[1],
        assignedTo: DUMMY_AGENTS[2], // Manager handles escalated
        category: 'System Issue',
        attachments: [],
        workflowStages: ['NEW', 'OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'],
        currentWorkflowStage: 'ESCALATED',
        auditLog: [
            { timestamp: '2023-10-23T13:00:00Z', user: 'System', action: 'Ticket Created' },
            { timestamp: '2023-10-23T13:10:00Z', user: 'System', action: 'Assigned to Bob Johnson' },
            { timestamp: '2023-10-24T09:00:00Z', user: 'Agent Bob Johnson', action: 'Status changed to IN_PROGRESS' },
            { timestamp: '2023-10-26T14:00:00Z', user: 'Agent Bob Johnson', action: 'Status changed to ESCALATED' },
            { timestamp: '2023-10-26T14:05:00Z', user: 'System', action: 'Reassigned to Charlie Brown (Manager)' },
        ],
    },
    {
        id: 'TKT006',
        title: 'Request for New User Onboarding',
        description: 'Need to set up a new user account for John Doe from Acme Corp.',
        status: 'APPROVED',
        priority: 'Medium',
        createdAt: '2023-10-22T10:00:00Z',
        updatedAt: '2023-10-23T11:00:00Z',
        customer: DUMMY_CUSTOMERS[0],
        assignedTo: DUMMY_AGENTS[1],
        category: 'User Management',
        attachments: [],
        workflowStages: ['NEW', 'APPROVED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        currentWorkflowStage: 'APPROVED',
        auditLog: [
            { timestamp: '2023-10-22T10:00:00Z', user: 'System', action: 'Ticket Created' },
            { timestamp: '2023-10-22T10:15:00Z', user: 'Support Manager Charlie Brown', action: 'Status changed to APPROVED' },
            { timestamp: '2023-10-23T11:00:00Z', user: 'System', action: 'Assigned to Bob Johnson' },
        ],
    },
    {
        id: 'TKT007',
        title: 'Password Reset Request',
        description: 'Customer forgot password and needs a reset link.',
        status: 'RESOLVED',
        priority: 'High',
        createdAt: '2023-10-26T08:30:00Z',
        updatedAt: '2023-10-26T08:45:00Z',
        customer: DUMMY_CUSTOMERS[2],
        assignedTo: DUMMY_AGENTS[0],
        category: 'Account Access',
        attachments: [],
        workflowStages: ['NEW', 'OPEN', 'RESOLVED', 'CLOSED'],
        currentWorkflowStage: 'RESOLVED',
        auditLog: [
            { timestamp: '2023-10-26T08:30:00Z', user: 'System', action: 'Ticket Created' },
            { timestamp: '2023-10-26T08:35:00Z', user: 'System', action: 'Assigned to Alice Smith' },
            { timestamp: '2023-10-26T08:40:00Z', user: 'Agent Alice Smith', action: 'Status changed to RESOLVED' },
            { timestamp: '2023-10-26T08:45:00Z', user: 'System', action: 'Auto-closed after resolution confirmation' },
        ],
    },
    {
        id: 'TKT008',
        title: 'CRM Integration Bug',
        description: 'Data sync failure between our application and Salesforce CRM.',
        status: 'CLOSED',
        priority: 'Critical',
        createdAt: '2023-10-20T10:00:00Z',
        updatedAt: '2023-10-21T15:00:00Z',
        customer: DUMMY_CUSTOMERS[1],
        assignedTo: DUMMY_AGENTS[2], // Manager, then assigned to Tech Team (not modeled explicitly here)
        category: 'Integration',
        attachments: [],
        workflowStages: ['NEW', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        currentWorkflowStage: 'CLOSED',
        auditLog: [
            { timestamp: '2023-10-20T10:00:00Z', user: 'System', action: 'Ticket Created' },
            { timestamp: '2023-10-20T10:10:00Z', user: 'System', action: 'Assigned to Charlie Brown (Manager)' },
            { timestamp: '2023-10-20T11:00:00Z', user: 'Support Manager Charlie Brown', action: 'Assigned to Technical Team' },
            { timestamp: '2023-10-21T14:00:00Z', user: 'Technical Team Member', action: 'Status changed to RESOLVED' },
            { timestamp: '2023-10-21T15:00:00Z', user: 'System', action: 'Ticket Closed' },
        ],
    },
];

// --- Utility Functions ---
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString(); // Adjust locale as needed
};

// --- Main Application Component ---
function App() {
    const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
    const [currentUser, setCurrentUser] = useState({ id: 'AGENT001', name: 'Alice Smith', role: ROLES.SUPPORT_AGENT }); // Default logged-in user
    const [tickets, setTickets] = useState(DUMMY_TICKETS);

    const navigate = (screen, params = {}) => {
        setView({ screen, params });
    };

    const handleLogin = (userRole) => {
        // In a real app, this would involve authentication
        switch (userRole) {
            case ROLES.SUPPORT_AGENT:
                setCurrentUser({ id: 'AGENT001', name: 'Alice Smith', role: ROLES.SUPPORT_AGENT });
                break;
            case ROLES.SUPPORT_MANAGER:
                setCurrentUser({ id: 'AGENT003', name: 'Charlie Brown', role: ROLES.SUPPORT_MANAGER });
                break;
            case ROLES.CUSTOMER:
                setCurrentUser({ id: 'CUST001', name: 'Acme Corp', role: ROLES.CUSTOMER });
                break;
            case ROLES.ADMIN:
                setCurrentUser({ id: 'ADMIN001', name: 'Super Admin', role: ROLES.ADMIN });
                break;
            default:
                setCurrentUser(null);
        }
        navigate('DASHBOARD');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        navigate('LOGIN');
    };

    const getStatusStyle = (statusKey) => {
        const statusInfo = STATUS_MAP[statusKey];
        return statusInfo ? { backgroundColor: statusInfo.color } : { backgroundColor: 'var(--color-secondary)' };
    };

    const getStatusLabel = (statusKey) => {
        return STATUS_MAP[statusKey]?.label || statusKey;
    };

    const handleTicketStatusChange = (ticketId, newStatus) => {
        setTickets(prevTickets =>
            prevTickets.map(ticket =>
                (ticket.id === ticketId)
                    ? {
                        ...ticket,
                        status: newStatus,
                        updatedAt: new Date().toISOString(),
                        currentWorkflowStage: newStatus, // Simplified for this example
                        auditLog: [...(ticket.auditLog || []), { timestamp: new Date().toISOString(), user: currentUser?.name || 'System', action: `Status changed to ${getStatusLabel(newStatus)}` }],
                    }
                    : ticket
            )
        );
        // After status change, navigate back to detail or list
        if (view.screen === 'TICKET_DETAIL') {
            navigate('TICKET_DETAIL', { ticketId });
        } else if (view.screen === 'TICKET_LIST') {
            navigate('TICKET_LIST');
        }
    };

    const handleTicketSave = (formData, isNew) => {
        if (isNew) {
            const newTicket = {
                id: `TKT${String(tickets.length + 1).padStart(3, '0')}`,
                ...formData,
                status: formData.status || 'NEW',
                priority: formData.priority || 'Medium',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                workflowStages: ['NEW', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], // Default workflow
                currentWorkflowStage: formData.status || 'NEW',
                auditLog: [{ timestamp: new Date().toISOString(), user: currentUser?.name || 'System', action: 'Ticket Created' }],
            };
            setTickets(prevTickets => [...prevTickets, newTicket]);
        } else {
            setTickets(prevTickets =>
                prevTickets.map(ticket =>
                    (ticket.id === formData.id)
                        ? {
                            ...ticket,
                            ...formData,
                            updatedAt: new Date().toISOString(),
                            auditLog: [...(ticket.auditLog || []), { timestamp: new Date().toISOString(), user: currentUser?.name || 'System', action: 'Ticket details updated' }],
                        }
                        : ticket
                )
            );
        }
        navigate('TICKET_DETAIL', { ticketId: formData.id || `TKT${String(tickets.length + 1).padStart(3, '0')}` });
    };

    const getBreadcrumbs = () => {
        const crumbs = [{ label: 'Home', screen: 'DASHBOARD' }];
        if (view.screen === 'TICKET_LIST') {
            crumbs.push({ label: 'Tickets', screen: 'TICKET_LIST' });
        } else if (view.screen === 'TICKET_DETAIL' && view.params?.ticketId) {
            crumbs.push({ label: 'Tickets', screen: 'TICKET_LIST' });
            const ticket = tickets.find(t => t.id === view.params.ticketId);
            crumbs.push({ label: ticket?.title || 'Detail', screen: 'TICKET_DETAIL', params: { ticketId: view.params.ticketId } });
        } else if (view.screen === 'TICKET_EDIT' && view.params?.ticketId) {
            crumbs.push({ label: 'Tickets', screen: 'TICKET_LIST' });
            const ticket = tickets.find(t => t.id === view.params.ticketId);
            crumbs.push({ label: ticket?.title || 'Detail', screen: 'TICKET_DETAIL', params: { ticketId: view.params.ticketId } });
            crumbs.push({ label: 'Edit', screen: 'TICKET_EDIT', params: { ticketId: view.params.ticketId } });
        } else if (view.screen === 'TICKET_CREATE') {
            crumbs.push({ label: 'Tickets', screen: 'TICKET_LIST' });
            crumbs.push({ label: 'New Ticket', screen: 'TICKET_CREATE' });
        }
        return crumbs;
    };

    // RBAC: Determine what actions or data a user can see/do
    const canViewTicket = (ticket, user) => {
        if (!user) return false;
        if (user.role === ROLES.ADMIN || user.role === ROLES.SUPPORT_MANAGER) return true;
        if (user.role === ROLES.SUPPORT_AGENT && ticket.assignedTo?.id === user.id) return true;
        if (user.role === ROLES.CUSTOMER && ticket.customer?.id === user.id) return true;
        return false;
    };

    const filteredTickets = tickets.filter(ticket => canViewTicket(ticket, currentUser));

    // --- Components for different views ---

    const Header = ({ currentUser, navigate, handleLogout, view }) => (
        <header className="header">
            <h1 className="header__title">Customer Service</h1>
            {currentUser ? (
                <>
                    <nav className="header__nav">
                        <ul>
                            <li key="dashboard">
                                <a
                                    href="#"
                                    onClick={() => navigate('DASHBOARD')}
                                    className={view.screen === 'DASHBOARD' ? 'active' : ''}
                                >
                                    Dashboard
                                </a>
                            </li>
                            <li key="tickets">
                                <a
                                    href="#"
                                    onClick={() => navigate('TICKET_LIST')}
                                    className={(view.screen === 'TICKET_LIST' || view.screen === 'TICKET_DETAIL' || view.screen === 'TICKET_EDIT' || view.screen === 'TICKET_CREATE') ? 'active' : ''}
                                >
                                    Tickets
                                </a>
                            </li>
                            {/* Example of RBAC for navigation */}
                            {((currentUser.role === ROLES.SUPPORT_MANAGER) || (currentUser.role === ROLES.ADMIN)) && (
                                <li key="reports">
                                    <a href="#" onClick={() => alert('Reports view (not implemented)')}>Reports</a>
                                </li>
                            )}
                        </ul>
                    </nav>
                    <div className="header__user-info">
                        <span>Hello, {currentUser.name} ({currentUser.role})</span>
                        <button className="button--outline" onClick={handleLogout}>Logout</button>
                    </div>
                </>
            ) : (
                <div className="header__user-info">
                    <button className="button--primary" onClick={() => navigate('LOGIN')}>Login</button>
                </div>
            )}
        </header>
    );

    const TicketCard = ({ ticket, navigate }) => (
        <div className="card" onClick={() => navigate('TICKET_DETAIL', { ticketId: ticket.id })} role="button" tabIndex="0">
            <div className="card__header">
                <h3 className="card__title">{ticket.title}</h3>
                <span className="card__status" style={getStatusStyle(ticket.status)}>
                    {getStatusLabel(ticket.status)}
                </span>
            </div>
            <div className="card__content">
                <p><strong>Customer:</strong> {ticket.customer?.name || 'N/A'}</p>
                <p><strong>Assigned:</strong> {ticket.assignedTo?.name || 'Unassigned'}</p>
            </div>
            <div className="card__footer">
                <span>Created: {formatDateTime(ticket.createdAt)}</span>
                <span>Priority: {ticket.priority}</span>
            </div>
        </div>
    );

    const DashboardScreen = ({ navigate, currentUser, tickets }) => {
        const myAssignedTickets = tickets.filter(t => (t.assignedTo?.id === currentUser?.id) && ((t.status === 'OPEN') || (t.status === 'IN_PROGRESS') || (t.status === 'ESCALATED')));
        const totalTickets = tickets.length;
        const openTickets = tickets.filter(t => (t.status === 'OPEN') || (t.status === 'IN_PROGRESS') || (t.status === 'ESCALATED')).length;
        const resolvedToday = tickets.filter(t => (t.status === 'RESOLVED') && (new Date(t.updatedAt || '').toDateString() === new Date().toDateString())).length;

        return (
            <div className="full-screen-page">
                <div className="page-header">
                    <h1>Dashboard</h1>
                </div>

                <div className="card-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div className="card pulse-animation" onClick={() => navigate('TICKET_LIST', { status: 'OPEN' })} role="button" tabIndex="0">
                        <div className="card__header">
                            <h3 className="card__title">Total Tickets</h3>
                        </div>
                        <div className="card__content">
                            <p style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>{totalTickets}</p>
                        </div>
                    </div>
                    <div className="card pulse-animation" onClick={() => navigate('TICKET_LIST', { status: 'OPEN' })} role="button" tabIndex="0">
                        <div className="card__header">
                            <h3 className="card__title">Open & In Progress</h3>
                        </div>
                        <div className="card__content">
                            <p style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--status-open)' }}>{openTickets}</p>
                        </div>
                    </div>
                    <div className="card pulse-animation" onClick={() => navigate('TICKET_LIST', { status: 'RESOLVED' })} role="button" tabIndex="0">
                        <div className="card__header">
                            <h3 className="card__title">Resolved Today</h3>
                        </div>
                        <div className="card__content">
                            <p style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--status-resolved)' }}>{resolvedToday}</p>
                        </div>
                    </div>
                </div>

                <div className="detail-section" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h2>Charts & Analytics</h2>
                    <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                        <div className="chart-container">Bar Chart (Ticket Volume)</div>
                        <div className="chart-container">Line Chart (Resolution Times)</div>
                        <div className="chart-container">Donut Chart (Ticket Categories)</div>
                        <div className="chart-container">Gauge Chart (SLA Compliance)</div>
                    </div>
                    <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'right' }}>
                        <button className="button button--outline" onClick={() => alert('Exporting dashboard data...')}>Export Dashboard</button>
                    </div>
                </div>

                <div className="detail-section">
                    <h2>My Assigned Tickets</h2>
                    {(myAssignedTickets.length > 0) ? (
                        <div className="card-grid">
                            {myAssignedTickets.map(ticket => (
                                <TicketCard key={ticket.id} ticket={ticket} navigate={navigate} />
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>No tickets currently assigned to you. Enjoy the peace!</p>
                    )}
                </div>
            </div>
        );
    };

    const TicketListScreen = ({ navigate, tickets }) => {
        const [filterStatus, setFilterStatus] = useState(view.params?.status || 'ALL');
        const [searchQuery, setSearchQuery] = useState('');

        const filteredAndSearchedTickets = tickets.filter(ticket => {
            const matchesStatus = (filterStatus === 'ALL') || (ticket.status === filterStatus);
            const matchesSearch = ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                ticket.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                ticket.assignedTo?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            return (matchesStatus && matchesSearch);
        });

        return (
            <div className="full-screen-page">
                <div className="breadcrumbs">
                    {getBreadcrumbs().map((crumb, index) => (
                        <React.Fragment key={crumb.screen}>
                            <a href="#" onClick={() => navigate(crumb.screen, crumb.params)}>{crumb.label}</a>
                            {index < getBreadcrumbs().length - 1 && <span>/</span>}
                        </React.Fragment>
                    ))}
                </div>
                <div className="page-header">
                    <h1>Tickets</h1>
                    <div>
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: 'var(--spacing-sm)', marginRight: 'var(--spacing-md)', borderRadius: 'var(--border-radius-sm)', border: 'var(--border-width) solid var(--color-border)' }}
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ padding: 'var(--spacing-sm)', marginRight: 'var(--spacing-md)', borderRadius: 'var(--border-radius-sm)', border: 'var(--border-width) solid var(--color-border)' }}
                        >
                            <option value="ALL">All Statuses</option>
                            {Object.entries(STATUS_MAP).map(([key, value]) => (
                                <option key={key} value={key}>{value.label}</option>
                            ))}
                        </select>
                        <button className="button button--primary" onClick={() => navigate('TICKET_CREATE')}>
                            + Create New Ticket
                        </button>
                    </div>
                </div>

                {(filteredAndSearchedTickets.length > 0) ? (
                    <div className="card-grid">
                        {filteredAndSearchedTickets.map(ticket => (
                            <TicketCard key={ticket.id} ticket={ticket} navigate={navigate} />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-light)' }}>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>No tickets match your criteria.</p>
                        <button className="button button--primary" onClick={() => navigate('TICKET_CREATE')}>
                            Create First Ticket
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const TicketDetailScreen = ({ navigate, ticketId, tickets, handleTicketStatusChange, currentUser }) => {
        const ticket = tickets.find(t => t.id === ticketId);

        if (!ticket) {
            return (
                <div className="full-screen-page">
                    <p style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>Ticket not found.</p>
                    <button className="button button--primary" onClick={() => navigate('TICKET_LIST')}>Back to Tickets</button>
                </div>
            );
        }

        const currentStageIndex = ticket.workflowStages?.indexOf(ticket.currentWorkflowStage);

        const canEdit = ((currentUser?.role === ROLES.SUPPORT_AGENT) || (currentUser?.role === ROLES.SUPPORT_MANAGER) || (currentUser?.role === ROLES.ADMIN));
        const canChangeStatus = canEdit; // Simplified for demo

        return (
            <div className="full-screen-page">
                <div className="breadcrumbs">
                    {getBreadcrumbs().map((crumb, index) => (
                        <React.Fragment key={crumb.screen}>
                            <a href="#" onClick={() => navigate(crumb.screen, crumb.params)}>{crumb.label}</a>
                            {index < getBreadcrumbs().length - 1 && <span>/</span>}
                        </React.Fragment>
                    ))}
                </div>
                <div className="page-header">
                    <h1>{ticket.title} <span className="card__status" style={getStatusStyle(ticket.status)}>{getStatusLabel(ticket.status)}</span></h1>
                    {canEdit && (
                        <div>
                            <button className="button button--outline" style={{ marginRight: 'var(--spacing-md)' }} onClick={() => navigate('TICKET_EDIT', { ticketId: ticket.id })}>
                                Edit Ticket
                            </button>
                            {canChangeStatus && (
                                <select
                                    onChange={(e) => handleTicketStatusChange(ticket.id, e.target.value)}
                                    value={ticket.status}
                                    style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)', border: 'var(--border-width) solid var(--color-border)' }}
                                >
                                    {Object.entries(STATUS_MAP).map(([key, value]) => (
                                        <option key={key} value={key}>{value.label}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </div>

                <div className="detail-section">
                    <h2>Workflow Progress</h2>
                    <div className="workflow-tracker">
                        {ticket.workflowStages?.map((stage, index) => (
                            <div key={stage} className="workflow-stage">
                                <div className={((index <= currentStageIndex) ? ((index < currentStageIndex && STATUS_MAP[stage]?.label !== 'New') ? 'workflow-stage__circle completed' : 'workflow-stage__circle active') : 'workflow-stage__circle')}>
                                    {index + 1}
                                </div>
                                <div className={((index <= currentStageIndex) ? 'workflow-stage__label active' : 'workflow-stage__label')}>
                                    {getStatusLabel(stage)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="detail-section">
                    <h2>Details</h2>
                    <div className="detail-item">
                        <div className="detail-item__label">Description:</div>
                        <div className="detail-item__value">{ticket.description}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-item__label">Customer:</div>
                        <div className="detail-item__value">{ticket.customer?.name || 'N/A'}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-item__label">Assigned To:</div>
                        <div className="detail-item__value">{ticket.assignedTo?.name || 'Unassigned'}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-item__label">Priority:</div>
                        <div className="detail-item__value">{ticket.priority}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-item__label">Category:</div>
                        <div className="detail-item__value">{ticket.category}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-item__label">Created At:</div>
                        <div className="detail-item__value">{formatDateTime(ticket.createdAt)}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-item__label">Last Updated:</div>
                        <div className="detail-item__value">{formatDateTime(ticket.updatedAt)}</div>
                    </div>
                    {(ticket.attachments?.length > 0) && (
                        <div className="detail-item">
                            <div className="detail-item__label">Attachments:</div>
                            <div className="detail-item__value">
                                {ticket.attachments.map((file, index) => (
                                    <span key={index} style={{ display: 'block' }}>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Audit Log Section */}
                (((currentUser?.role === ROLES.SUPPORT_MANAGER) || (currentUser?.role === ROLES.ADMIN)) && (
                    <div className="detail-section">
                        <h2>Audit Log (Immutable)</h2>
                        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                            {ticket.auditLog?.map((log, index) => (
                                <li key={index} style={{ marginBottom: 'var(--spacing-xs)', borderBottom: '1px dotted var(--color-border)', paddingBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                                    <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-light)' }}>{formatDateTime(log.timestamp)}: </span>
                                    {log.user} - {log.action}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    const TicketFormScreen = ({ navigate, ticketId, tickets, handleTicketSave }) => {
        const isNew = !ticketId;
        const existingTicket = tickets.find(t => t.id === ticketId);

        const [formData, setFormData] = useState({
            title: existingTicket?.title || '',
            description: existingTicket?.description || '',
            status: existingTicket?.status || 'NEW',
            priority: existingTicket?.priority || 'Medium',
            customerId: existingTicket?.customer?.id || '',
            assignedToId: existingTicket?.assignedTo?.id || '',
            category: existingTicket?.category || '',
            attachments: existingTicket?.attachments || [], // Placeholder for file uploads
        });
        const [errors, setErrors] = useState({});

        useEffect(() => {
            if (!isNew && !existingTicket) {
                // Should not happen with proper routing, but good for safety
                navigate('TICKET_LIST');
            }
        }, [isNew, existingTicket, navigate]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
            // Clear error on change for immediate feedback
            if (errors[name]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        };

        const validateForm = () => {
            const newErrors = {};
            if (!formData.title.trim()) newErrors.title = 'Title is mandatory.';
            if (!formData.description.trim()) newErrors.description = 'Description is mandatory.';
            if (!formData.customerId) newErrors.customerId = 'Customer is mandatory.';
            if (!formData.category.trim()) newErrors.category = 'Category is mandatory.';
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (validateForm()) {
                const customer = DUMMY_CUSTOMERS.find(c => c.id === formData.customerId);
                const assignedTo = DUMMY_AGENTS.find(a => a.id === formData.assignedToId);

                const dataToSave = {
                    ...formData,
                    customer,
                    assignedTo,
                    id: existingTicket?.id, // Keep ID for existing ticket
                };
                handleTicketSave(dataToSave, isNew);
            }
        };

        const handleFileUpload = (e) => {
            // Placeholder for file upload logic
            const files = Array.from(e.target.files || []);
            alert(`Simulating upload of ${files.length} files. Not actually uploading.`);
            setFormData(prev => ({
                ...prev,
                attachments: [...(prev.attachments || []), ...files.map(f => ({ name: f.name, url: '#' }))]
            }));
        };


        return (
            <div className="full-screen-page">
                <div className="breadcrumbs">
                    {getBreadcrumbs().map((crumb, index) => (
                        <React.Fragment key={crumb.screen}>
                            <a href="#" onClick={() => navigate(crumb.screen, crumb.params)}>{crumb.label}</a>
                            {index < getBreadcrumbs().length - 1 && <span>/</span>}
                        </React.Fragment>
                    ))}
                </div>
                <div className="page-header">
                    <h1>{isNew ? 'Create New Ticket' : `Edit Ticket: ${existingTicket?.title || 'N/A'}`}</h1>
                </div>

                <form onSubmit={handleSubmit} className="detail-section">
                    <div className="form-group">
                        <label htmlFor="title">Title <span style={{ color: 'var(--status-rejected)' }}>*</span></label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                        {errors.title && <p className="validation-error">{errors.title}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description <span style={{ color: 'var(--status-rejected)' }}>*</span></label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                        {errors.description && <p className="validation-error">{errors.description}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="customerId">Customer <span style={{ color: 'var(--status-rejected)' }}>*</span></label>
                        <select
                            id="customerId"
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Customer</option>
                            {DUMMY_CUSTOMERS.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </select>
                        {errors.customerId && <p className="validation-error">{errors.customerId}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="assignedToId">Assigned To (Auto-populated for New/Admin)</label>
                        <select
                            id="assignedToId"
                            name="assignedToId"
                            value={formData.assignedToId}
                            onChange={handleChange}
                        >
                            <option value="">Unassigned</option>
                            {DUMMY_AGENTS.map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Category <span style={{ color: 'var(--status-rejected)' }}>*</span></label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                        {errors.category && <p className="validation-error">{errors.category}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="attachments">Attachments</label>
                        <input
                            type="file"
                            id="attachments"
                            name="attachments"
                            multiple
                            onChange={handleFileUpload}
                            style={{ border: 'none', padding: 0 }}
                        />
                        {(formData.attachments?.length > 0) && (
                            <div style={{ marginTop: 'var(--spacing-xs)' }}>
                                {formData.attachments.map((file, index) => (
                                    <p key={index} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                                        {file.name}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="button button--primary">
                            {isNew ? 'Create Ticket' : 'Save Changes'}
                        </button>
                        <button type="button" className="button button--secondary" onClick={() => (isNew ? navigate('TICKET_LIST') : navigate('TICKET_DETAIL', { ticketId }))}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const LoginScreen = ({ handleLogin }) => (
        <div className="full-screen-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Login as:</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <button className="button button--primary" onClick={() => handleLogin(ROLES.SUPPORT_AGENT)}>
                        Support Agent
                    </button>
                    <button className="button button--primary" onClick={() => handleLogin(ROLES.SUPPORT_MANAGER)}>
                        Support Manager
                    </button>
                    <button className="button button--primary" onClick={() => handleLogin(ROLES.CUSTOMER)}>
                        Customer
                    </button>
                    <button className="button button--primary" onClick={() => handleLogin(ROLES.ADMIN)}>
                        Admin
                    </button>
                </div>
            </div>
        </div>
    );

    const renderScreen = () => {
        if (!currentUser && view.screen !== 'LOGIN') {
            return <LoginScreen handleLogin={handleLogin} />;
        }

        switch (view.screen) {
            case 'DASHBOARD':
                return <DashboardScreen navigate={navigate} currentUser={currentUser} tickets={filteredTickets} />;
            case 'TICKET_LIST':
                return <TicketListScreen navigate={navigate} tickets={filteredTickets} />;
            case 'TICKET_DETAIL':
                return <TicketDetailScreen navigate={navigate} ticketId={view.params?.ticketId} tickets={filteredTickets} handleTicketStatusChange={handleTicketStatusChange} currentUser={currentUser} />;
            case 'TICKET_EDIT':
                return <TicketFormScreen navigate={navigate} ticketId={view.params?.ticketId} tickets={tickets} handleTicketSave={handleTicketSave} />;
            case 'TICKET_CREATE':
                return <TicketFormScreen navigate={navigate} tickets={tickets} handleTicketSave={handleTicketSave} />;
            case 'LOGIN':
                return <LoginScreen handleLogin={handleLogin} />;
            default:
                return <DashboardScreen navigate={navigate} currentUser={currentUser} tickets={filteredTickets} />;
        }
    };

    return (
        <div className="app-container">
            <Header currentUser={currentUser} navigate={navigate} handleLogout={handleLogout} view={view} />
            <main className="main-content">
                {renderScreen()}
            </main>
        </div>
    );
}

export default App;