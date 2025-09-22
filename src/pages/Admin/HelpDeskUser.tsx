import { api } from '@/components/common/api';
import { DatePicker, message as antMessage, Pagination, Select, Tooltip } from 'antd';
import type { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';
import '../../common.css';

const { RangePicker } = DatePicker;

interface QueryData {
  id: number;
  name: string;
  email: string;
  queryType: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  message: string;
  resolvedAt: number | null;
}

interface ChatMessage {
  id: number;
  text: string;
  isMine: boolean;
  senderRole?: string;
  createdAt: number;
  updatedAt: number;
  message?: string;
}

interface FilterParams {
  search: string;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  pageNumber: number;
  pageSize: number;
}

const HelpDeskUser: React.FC = () => {
  // --- Form state ---
  const [queryType, setQueryType] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // --- Queries table + search ---
  const [queries, setQueries] = useState<QueryData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [totalQueries, setTotalQueries] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Filter states ---
  const [searchText, setSearchText] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState<FilterParams>({
    search: '',
    startDate: null,
    endDate: null,
    status: null,
    pageNumber: 1,
    pageSize: 10,
  });

  // --- Chat panel state ---
  const [selectedQueryId, setSelectedQueryId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [selectedQueryStatus, setSelectedQueryStatus] = useState<string | null>(null);

  useEffect(() => {
    loadQueries();
  }, []);

  useEffect(() => {
    if (selectedQueryId) {
      const currentQuery = queries.find((q) => q.id === selectedQueryId);
      if (currentQuery) {
        setSelectedQueryStatus(currentQuery.status);
      }
    }
  }, [queries, selectedQueryId]);

  const formatDateForApi = (date: Dayjs | null): string | null => {
    return date ? date.format('YYYY-MM-DD') : null;
  };

  const loadQueries = async (params: FilterParams = filterParams) => {
    try {
      setIsRefreshing(true);

      const res = await api.app.getUserQueries(
        params.pageNumber,
        params.pageSize,
        params.search,
        params.startDate,
        params.endDate,
        params.status,
      );

      const mapped = (res.tickets || []).map((t: any) => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
        queryType: t.queryType,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        message: t.message,
        resolvedAt: t.status === 'Resolved' ? t.resolvedAt || t.updatedAt : null,
      }));

      setQueries(mapped);
      setTotalQueries(res.totalCount || mapped.length);
    } catch (err) {
      console.error('Failed to fetch queries:', err);
      antMessage.error({
        content: 'Failed to fetch queries.',
        icon: <span className="notification-error-icon"> ✘ </span>,
        className: 'notification-error-style',
        duration: 3,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const applyFilters = () => {
    const updatedParams = {
      ...filterParams,
      search: searchText,
      startDate: dateRange && dateRange[0] ? formatDateForApi(dateRange[0]) : null,
      endDate: dateRange && dateRange[1] ? formatDateForApi(dateRange[1]) : null,
      status: statusFilter === 'All' ? null : statusFilter,
      pageNumber: 1,
    };

    setFilterParams(updatedParams);
    loadQueries(updatedParams);
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
  };

  const handleStatusChange = (value: string | null) => {
    setStatusFilter(value);
  };

  const handleSearch = () => {
    applyFilters();
    antMessage.info({
      content: 'Applying filters...',
      duration: 1,
    });
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    const updatedParams = {
      ...filterParams,
      pageNumber: page,
      pageSize: pageSize || filterParams.pageSize,
    };

    setFilterParams(updatedParams);
    loadQueries(updatedParams);
  };

  const handleRefresh = () => {
    setSearchText('');
    setDateRange(null);
    setStatusFilter(null);
    const defaultParams = {
      search: '',
      startDate: null,
      endDate: null,
      status: null,
      pageNumber: 1,
      pageSize: 10,
    };
    setFilterParams(defaultParams);
    loadQueries(defaultParams);

    antMessage.info({
      content: 'Refreshing queries...',
      duration: 1,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const resp = await api.app.createTicket({ queryType, message });
      const msg = (resp || '').toString().toLowerCase();

      if (msg.includes('ticket created')) {
        antMessage.success({
          content: 'Ticket submitted successfully!',
          icon: <span className="notification-success-icon"> ✓ </span>,
          className: 'notification-success-style',
          duration: 3,
        });
        setQueryType('');
        setMessage('');
        await loadQueries();
      } else {
        antMessage.error({
          content: resp || 'Failed to submit ticket.',
          icon: <span className="notification-error-icon"> ✘ </span>,
          className: 'notification-error-style',
          duration: 3,
        });
      }
    } catch (err) {
      console.error(err);
      antMessage.error({
        content: 'Something went wrong while submitting your query.',
        icon: <span className="notification-error-icon"> ✘ </span>,
        className: 'notification-error-style',
        duration: 3,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = async (queryId: number) => {
    setSelectedQueryId(queryId);
    setLoadingMessages(true);

    try {
      const singleQueryParams = {
        ...filterParams,
        search: queryId.toString(),
      };

      const apiStatusParam = singleQueryParams.status === 'All' ? null : singleQueryParams.status;

      const updatedQueryRes = await api.app.getUserQueries(
        singleQueryParams.pageNumber,
        singleQueryParams.pageSize,
        singleQueryParams.search,
        singleQueryParams.startDate,
        singleQueryParams.endDate,
        apiStatusParam,
      );

      const updatedQueries = (updatedQueryRes.tickets || []).map((t: any) => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
        queryType: t.queryType,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        message: t.message,
        resolvedAt: t.status === 'Resolved' ? t.resolvedAt || t.updatedAt : null,
      }));

      const msgs = await api.app.getMessages(queryId);
      const ticket = updatedQueries.find((q) => q.id === queryId);

      if (ticket) {
        setSelectedQueryStatus(ticket.status);

        const hasInitialMessage = msgs.some(
          (msg) => msg.text === ticket.message || msg.message === ticket.message,
        );

        if (!hasInitialMessage) {
          const initialMsg: ChatMessage = {
            id: 0,
            text: ticket.message,
            isMine: false,
            createdAt: ticket.createdAt,
            updatedAt: ticket.createdAt,
          };
          setMessages([initialMsg, ...msgs]);
        } else {
          setMessages(msgs);
        }

        if (ticket.status === 'Resolved') {
          antMessage.success({
            content: 'Your ticket is resolved!',
            icon: <span className="notification-success-icon"> ✓ </span>,
            className: 'notification-success-style',
            duration: 3,
          });
        }
      } else {
        setMessages(msgs);
        setSelectedQueryStatus(null);
      }

      loadQueries();
    } catch (err) {
      console.error(err);
      antMessage.error({
        content: 'Could not load chat messages or updated query data.',
        icon: <span className="notification-error-icon"> ✘ </span>,
        className: 'notification-error-style',
        duration: 3,
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || selectedQueryId === null) {
      console.warn('Empty message or no selected query.');
      return;
    }

    try {
      const tempMessage: ChatMessage = {
        id: Date.now(),
        text: chatInput,
        isMine: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setMessages((prevMessages) => [...prevMessages, tempMessage]);
      setChatInput('');

      await api.app.postReply(selectedQueryId, chatInput);

      antMessage.success({
        content: 'Your message was sent successfully!',
        icon: <span className="notification-success-icon"> ✓ </span>,
        className: 'notification-success-style',
        duration: 3,
      });

      loadQueries();
    } catch (err: any) {
      console.error('Failed to send message:', err);

      if (err?.response?.data) {
        console.error('Server Error Response:', err.response.data);
      } else {
        console.error('Error Details:', err);
      }

      antMessage.error({
        content: 'Failed to send message.',
        icon: <span className="notification-error-icon"> ✘ </span>,
        className: 'notification-error-style',
        duration: 3,
      });
    }
  };

  const selectedQuery = selectedQueryId ? queries.find((q) => q.id === selectedQueryId) : null;

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString();
  };

  const formatChatDate = (timestamp: number) => {
    const msgDate = new Date(timestamp);
    const today = new Date();

    const isToday = msgDate.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = msgDate.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return msgDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const groupMessagesByDate = (msgs: ChatMessage[]) => {
    return msgs.reduce((groups: { [key: string]: ChatMessage[] }, msg) => {
      const dateKey = formatChatDate(msg.createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
      return groups;
    }, {});
  };

  return (
    <div className="helpdesk-main-wrapper">
      <div className="helpdesk-content-container">
        {/* ====== Header Section ====== */}
        <div className="helpdesk-header-section">
          <h1 className="helpdesk-main-title">Support Center</h1>
          <p className="helpdesk-subtitle">Submit your queries and track their status</p>
        </div>

        {/* ====== Ticket Creation Form ====== */}
        <div className="ticket-creation-section">
          <div className="ticket-form-header">
            <h2 className="section-title">Create New Ticket</h2>
            <div className="header-decoration"></div>
          </div>
          
          <form className="ticket-submission-form" onSubmit={handleSubmit}>
            <div className="form-input-wrapper">
              <div className="input-label-container">
                <label htmlFor="queryType" className="enhanced-form-label">
                  <div className="label-content">
                    <svg className="label-icon" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4"/>
                      <circle cx="12" cy="12" r="9"/>
                    </svg>
                    <span className="label-title">Issue Category</span>
                  </div>
                  {/* <span className="mandatory-asterisk">*</span> */}
                </label>
              </div>
              
              <div className="enhanced-select-wrapper">
                <select
                  id="queryType"
                  value={queryType}
                  onChange={(e) => setQueryType(e.target.value)}
                  required
                  className="premium-select-field"
                >
                  <option value="" disabled>Select your issue category...</option>
                  <option value="Deposit">💰 Payment & Deposit Issues</option>
                  <option value="Withdraw">💳 Withdrawal & Payout Problems</option>
                  <option value="Technical">⚙️ Technical Support & Bugs</option>
                  <option value="Other">💬 General Questions & Others</option>
                </select>
                <div className="select-dropdown-icon">
                  <svg viewBox="0 0 24 24">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </div>
                <div className="select-focus-ring"></div>
              </div>
            </div>

            <div className="form-input-wrapper">
              <div className="input-label-container">
                <label htmlFor="message" className="enhanced-form-label">
                  <div className="label-content">
                    <svg className="label-icon" viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span className="label-title">Issue Details</span>
                  </div>
                  {/* <span className="mandatory-asterisk">*</span> */}
                </label>
      
              </div>
              
              <div className="enhanced-textarea-wrapper">
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  maxLength={2000}
                  required
                  className="premium-textarea-field"
                />
                <div className="textarea-focus-ring"></div>
                <div className="textarea-bottom-bar">
                  <div className="character-progress-container">
                    <span className="character-count-text">{message.length}/2000 characters</span>
                    <div className="character-progress-bar">
                      <div 
                        className="character-progress-fill" 
                        style={{width: `${(message.length / 2000) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="ticket-submit-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="submit-loading-spinner"></div>
              ) : (
                <>
                  <span className="submit-button-text">Submit Ticket</span>
                  <svg className="submit-button-icon" viewBox="0 0 24 24">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ====== Tickets Management Section ====== */}
        <div className="tickets-management-section">
          <div className="management-header">
            <h2 className="section-title">Your Tickets</h2>
            <div className="header-decoration"></div>
          </div>

          {/* Filter Controls */}
          <div className="filter-controls-wrapper">
            <div className="filter-controls-container">
              <div className="date-range-filter">
                <RangePicker
                  onChange={(dates) => handleDateRangeChange(dates as [Dayjs | null, Dayjs | null])}
                  value={dateRange}
                  placeholder={['From Date', 'To Date']}
                  className="styled-date-picker"
                />
              </div>

              <div className="status-dropdown-filter">
                <Select
                  placeholder="Filter by Status"
                  value={statusFilter}
                  onChange={handleStatusChange}
                  allowClear
                  className="styled-status-select"
                  optionLabelProp="label"
                >
                  <Select.Option value="All" label="All Status">All Status</Select.Option>
                  <Select.Option value="Pending" label="Pending">Pending</Select.Option>
                  <Select.Option value="Resolved" label="Resolved">Resolved</Select.Option>
                </Select>
              </div>

              <div className="search-input-container">
                <input
                  type="text"
                  className="ticket-search-input"
                  placeholder="Search tickets..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <svg className="search-input-icon" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>

              <div className="filter-action-buttons">
                <button className="apply-filters-button" onClick={handleSearch}>
                  <svg className="button-icon" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  Apply Filters
                </button>

                <button 
                  className="refresh-data-button" 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                >
                  <Tooltip title="Refresh ticket data">
                    <svg 
                      className={`refresh-button-icon ${isRefreshing ? 'spinning-animation' : ''}`} 
                      viewBox="0 0 24 24"
                    >
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                  </Tooltip>
                </button>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="tickets-table-wrapper">
            <div className="responsive-table-container">
              <table className="modern-tickets-table">
                <thead className="table-header-section">
                  <tr>
                    <th className="table-header-cell">Ticket ID</th>
                    <th className="table-header-cell">Customer Name</th>
                    <th className="table-header-cell">Category</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Created Date</th>
                    <th className="table-header-cell">Resolved Date</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body-section">
                  {queries.length > 0 ? (
                    queries.map((ticket) => (
                      <tr key={ticket.id} className="table-data-row">
                        <td className="table-data-cell ticket-id-cell">#{ticket.id}</td>
                        <td className="table-data-cell customer-name-cell">{ticket.name}</td>
                        <td className="table-data-cell category-cell">{ticket.queryType}</td>
                        <td className="table-data-cell status-cell">
                          <span className={`status-badge ${ticket.status.toLowerCase()}-status`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="table-data-cell date-cell">{formatDate(ticket.createdAt)}</td>
                        <td className="table-data-cell date-cell">
                          {ticket.status === 'Resolved' ? formatDate(ticket.resolvedAt) : '-'}
                        </td>
                        <td className="table-data-cell action-cell">
                          <button 
                            className="view-ticket-button" 
                            onClick={() => handleView(ticket.id)}
                          >
                            <svg className="view-button-icon" viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="empty-state-row">
                      <td colSpan={7} className="empty-state-cell">
                        <div className="empty-state-content">
                          {isRefreshing ? (
                            <div className="loading-state">
                              <div className="loading-spinner"></div>
                              <span>Loading tickets...</span>
                            </div>
                          ) : (
                            <div className="no-data-state">
                              <svg className="empty-state-icon" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="m9 9 6 6"/>
                                <path d="m15 9-6 6"/>
                              </svg>
                              <span>No tickets found matching your criteria</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-pagination-container">
              <Pagination
                current={filterParams.pageNumber}
                pageSize={filterParams.pageSize}
                total={totalQueries}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `Total ${total} tickets`}
                className="styled-pagination"
              />
            </div>
          </div>
        </div>

        {/* ====== Chat Dialog Modal ====== */}
        {selectedQueryId !== null && (
          <div className="chat-dialog-backdrop">
            <div className="chat-dialog-container">
              <div className="chat-dialog-header">
                <div className="dialog-header-info">
                  <h3 className="dialog-title">
                    {selectedQuery
                      ? `Ticket Conversation: ${selectedQuery.queryType} (#${selectedQuery.id})`
                      : 'Ticket Conversation'}
                  </h3>
                  {selectedQuery && selectedQuery.status === 'Resolved' && (
                    <div className="resolution-info">
                      <svg className="resolution-icon" viewBox="0 0 24 24">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                      </svg>
                      <span>Resolved on: {formatDate(selectedQuery.resolvedAt)}</span>
                    </div>
                  )}
                </div>
                <button 
                  className="dialog-close-button" 
                  onClick={() => setSelectedQueryId(null)}
                >
                  <svg viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {loadingMessages ? (
                <div className="chat-loading-state">
                  <div className="chat-loading-spinner"></div>
                  <span>Loading conversation...</span>
                </div>
              ) : (
                <div className="chat-messages-container">
                  {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
                    <div key={date} className="message-group">
                      <div className="message-date-divider">
                        <span className="date-divider-text">{date}</span>
                      </div>

                      {msgs.map((msg) => (
                        <div
                          key={msg.id}
                          className={`chat-message-bubble ${msg.isMine ? 'user-message' : 'system-message'} ${
                            msg.senderRole === 'Admin' ? 'admin-message' : ''
                          }`}
                        >
                          {msg.senderRole === 'Admin' && (
                            <div className="admin-message-label">
                              <svg className="admin-icon" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                               Cosmo Customer Support 
                            </div>
                          )}
                          <div className="message-bubble-content">{msg.text || msg.message}</div>
                          <div className="message-timestamp">
                            {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <div className="chat-input-section">
                <div className="message-compose-area">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      selectedQueryStatus === 'Resolved'
                        ? 'This ticket is resolved. Create a new ticket for further assistance.'
                        : 'Type your message here...'
                    }
                    rows={3}
                    maxLength={2000}
                    className="chat-message-input"
                    disabled={selectedQueryStatus === 'Resolved'}
                  />
                  <div className="message-input-actions">
                    <span className="message-character-count">{chatInput.length}/2000</span>
                    <Tooltip
                      title={
                        selectedQueryStatus === 'Resolved'
                          ? 'This ticket is resolved. You cannot send further messages.'
                          : 'Send message'
                      }
                    >
                      <button
                        className="send-message-button"
                        onClick={handleSendMessage}
                        disabled={selectedQueryStatus === 'Resolved' || !chatInput.trim()}
                      >
                        <svg className="send-button-icon" viewBox="0 0 24 24">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22,2 15,22 11,13 2,9"/>
                        </svg>
                        Send
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpDeskUser;