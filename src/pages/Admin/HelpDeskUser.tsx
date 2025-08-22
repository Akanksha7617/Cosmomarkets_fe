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
  resolvedAt: number | null; // Added resolvedAt field
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

  //add loader
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

  // Add effect to update status when queries change
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

  // Modify the loadQueries function to use the correct parameter names
  const loadQueries = async (params: FilterParams = filterParams) => {
    try {
      setIsRefreshing(true);

      // Here's the key change - use searchParam instead of search
      const res = await api.app.getUserQueries(
        params.pageNumber,
        params.pageSize,
        params.search, // This should match 'searchParam' in the API
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
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
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
      status: statusFilter === 'All' ? null : statusFilter, // Fix: Convert 'All' to null
      pageNumber: 1, // Reset to first page when applying new filters
    };

    setFilterParams(updatedParams);
    loadQueries(updatedParams);
  };

  // Handle date range change
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
  };

  // Handle status filter change
  const handleStatusChange = (value: string | null) => {
    setStatusFilter(value);
  };

  // Search button handler
  const handleSearch = () => {
    applyFilters();

    antMessage.info({
      content: 'Applying filters...',
      duration: 1,
    });
  };

  // Pagination handler
  const handlePageChange = (page: number, pageSize?: number) => {
    const updatedParams = {
      ...filterParams,
      pageNumber: page,
      pageSize: pageSize || filterParams.pageSize,
    };

    setFilterParams(updatedParams);
    loadQueries(updatedParams);
  };

  // Refresh handler
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
    setIsSubmitting(true); //start load
    try {
      const resp = await api.app.createTicket({ queryType, message });
      const msg = (resp || '').toString().toLowerCase();

      if (msg.includes('ticket created')) {
        antMessage.success({
          content: ' Ticket submitted successfully!',
          icon: <span className="orange-success-icon"> ✓ </span>,
          className: 'orange-success-notification',
          duration: 3,
        });
        setQueryType('');
        setMessage('');
        await loadQueries();
      } else {
        antMessage.error({
          content: resp || ' Failed to submit ticket.',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
      }
    } catch (err) {
      console.error(err);
      antMessage.error({
        content: 'Something went wrong while submitting your query.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    }
    finally {
      setIsSubmitting(false);  // stop loader
    }
  };

  const handleView = async (queryId: number) => {
    setSelectedQueryId(queryId);
    setLoadingMessages(true);

    try {
      // Get updated data for this specific query
      const singleQueryParams = {
        ...filterParams,
        search: queryId.toString(),
      };

      // If status is "All", don't send status parameter to API
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
        // Make sure we're immediately updating the status
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
            content: ' Your ticket is resolved!',
            icon: <span className="orange-success-icon"> ✓ </span>,
            className: 'orange-success-notification',
            duration: 3,
          });
        }
      } else {
        setMessages(msgs);
        setSelectedQueryStatus(null);
      }

      // Refresh the query list to show updated status
      loadQueries();
    } catch (err) {
      console.error(err);
      antMessage.error({
        content: ' Could not load chat messages or updated query data.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || selectedQueryId === null) {
      console.warn('🚫 Empty message or no selected query.');
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

      // Success message after the message is sent
      antMessage.success({
        content: ' Your message was sent successfully!',
        icon: <span className="orange-success-icon"> ✓ </span>,
        className: 'orange-success-notification',
        duration: 3,
      });

      // Refresh queries to get updated status after sending message
      loadQueries();
    } catch (err: any) {
      console.error(' Failed to send message:', err);

      if (err?.response?.data) {
        console.error('🔍 Server Error Response:', err.response.data);
      } else {
        console.error('🔍 Error Details:', err);
      }

      // Error message if sending fails
      antMessage.error({
        content: ' Failed to send message.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    }
  };

  const selectedQuery = selectedQueryId ? queries.find((q) => q.id === selectedQueryId) : null;

  // Helper function to format date for display
  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString();
  };

  const formatChatDate = (timestamp: number) => {
    const msgDate = new Date(timestamp);
    const today = new Date();

    // Reset times to midnight for accurate comparison
    const isToday =
      msgDate.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday =
      msgDate.toDateString() === yesterday.toDateString();

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
      const dateKey = formatChatDate(msg.createdAt); // 👈 use helper here
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
      return groups;
    }, {});
  };

  return (
    <div className="page-wrapper">
      <div className="query-page-container">
        {/* ====== Submit Form ====== */}
        <h1>Submit Your Query</h1>
        <form className="query-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="queryType" className="form-label">
              Query Title
            </label>
            <div className="select-wrapper">
              <select
                id="queryType"
                value={queryType}
                onChange={(e) => setQueryType(e.target.value)}
                required
                className="modern-select"
              >
                <option value="" disabled>
                  Select Query Type
                </option>
                <option value="Deposit">Deposit</option>
                <option value="Withdraw">Withdraw</option>
                <option value="Technical">Technical</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              maxLength={2000}
              placeholder="Type your message here (200 words max)"
              required
              className="modern-textarea"
            />
          </div>
          {/* <button type="submit" className="submit-btn">
            <span>Submit Query</span>
            <svg
              className="btn-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button> */}
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="submit-query-loader"></span>
            ) : (
              <>
                <span>Submit Query</span>
                <svg
                  className="btn-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* ====== Queries Table ====== */}
        <div className="queries-table-container">
          <div className="filters-wrapper">
            <div className="filters-container">
              {/* Date Range Picker */}
              <div className="date-filter">
                <RangePicker
                  onChange={(dates) => handleDateRangeChange(dates as [Dayjs | null, Dayjs | null])}
                  value={dateRange}
                  placeholder={['Start Date', 'End Date']}
                />
              </div>

              {/* Status Filter with All option */}
              <div className="status-filter">
                <Select
                  placeholder="Status"
                  value={statusFilter}
                  onChange={handleStatusChange}
                  allowClear
                  optionLabelProp="label"
                >
                  <Select.Option value="All" label="All">
                    All
                  </Select.Option>
                  <Select.Option value="Pending" label="Pending">
                    Pending
                  </Select.Option>
                  <Select.Option value="Resolved" label="Resolved">
                    Resolved
                  </Select.Option>
                </Select>
              </div>

              {/* Search Box */}
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                {/* Search Button */}
                <button className="search-btn" onClick={handleSearch}>
                  Search
                </button>

                {/* Refresh Button */}
                <button className="refresh-btn" onClick={handleRefresh} disabled={isRefreshing}>
                  <Tooltip title="Refresh queries">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`refresh-icon ${isRefreshing ? 'rotating' : ''}`}
                    >
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                  </Tooltip>
                </button>
              </div>
            </div>
          </div>
          <div className="table-responsive">
            <table className="queries-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Query Type</th>
                  <th>Status</th>
                  <th>Issue Date</th>
                  {/* <th>Last Updated</th> */}
                  <th>Resolved Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queries.length > 0 ? (
                  queries.map((q) => (
                    <tr key={q.id}>
                      <td>{q.id}</td>
                      <td>{q.name}</td>
                      <td>{q.queryType}</td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            backgroundColor: q.status === 'Resolved' ? '#c6f6d5' : '#feebc8',
                            color: q.status === 'Resolved' ? '#22543d' : '#7b341e',
                          }}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td>{formatDate(q.createdAt)}</td>
                      {/* <td>{formatDate(q.updatedAt)}</td> */}
                      <td>{q.status === 'Resolved' ? formatDate(q.resolvedAt) : '-'}</td>
                      <td>
                        <button className="view-btn" onClick={() => handleView(q.id)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center' }}>
                      {isRefreshing
                        ? 'Loading queries...'
                        : 'No queries found matching your filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Component */}
          <div className="pagination-container" style={{ marginTop: '20px', textAlign: 'right' }}>
            <Pagination
              current={filterParams.pageNumber}
              pageSize={filterParams.pageSize}
              total={totalQueries}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `Total ${total}`}
            />
          </div>
        </div>

        {/* ====== Overlay Chat Panel ====== */}
        {selectedQueryId !== null && (
          <div className="chat-overlay">
            <div className="chat-modal">
              <div className="chat-modal-header">
                <h3>
                  {selectedQuery
                    ? `Conversation: ${selectedQuery.queryType} (#${selectedQuery.id})`
                    : 'Conversation'}
                </h3>
                <div className="query-status-info">
                  {selectedQuery && selectedQuery.status === 'Resolved' && (
                    <span style={{ fontSize: '14px', color: '#22543d' }}>
                      Resolved on: {formatDate(selectedQuery.resolvedAt)}
                    </span>
                  )}
                </div>
                <button className="close-btn" onClick={() => setSelectedQueryId(null)}>
                  &times;
                </button>
              </div>

              {loadingMessages ? (
                <div className="chat-loading">Loading messages...</div>
              ) : (
                <div className="chat-window">
                  {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
                    <div key={date}>
                      {/* Date Separator */}
                      <div className="chat-date-separator">{date}</div>

                      {msgs.map((msg) => (
                        <div
                          key={msg.id}
                          className={`chat-bubble ${msg.isMine ? 'mine' : 'theirs'}`}
                          style={{
                            backgroundColor:
                              msg.senderRole === 'Admin'
                                ? 'rgba(156, 255, 12, 0.55)'
                                : msg.isMine
                                  ? '#dcf8c6'
                                  : 'rgb(212, 238, 238)',
                          }}
                        >
                          {msg.senderRole === 'Admin' && (
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginBottom: '4px',
                                color: '#3670c7',
                              }}
                            >
                              Admin:
                            </div>
                          )}
                          <div className="chat-text">{msg.text || msg.message}</div>
                          <div className="chat-time">
                             {/* {new Date(msg.createdAt).toLocaleTimeString()} */}
                            {/* {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })} */}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

              )}

              <div className="message-send-box">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    selectedQueryStatus === 'Resolved'
                      ? 'Your ticket is resolved; you cannot send further messages. If you have any further queries, you may raise a new ticket '
                      : 'Type your message here'
                  }
                  rows={3}
                  maxLength={2000}
                  className="message-input"
                  disabled={selectedQueryStatus === 'Resolved'}
                />
                <Tooltip
                  title={
                    selectedQueryStatus === 'Resolved'
                      ? 'Your ticket is resolved, you cannot send further messages'
                      : ''
                  }
                >
                  <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={selectedQueryStatus === 'Resolved'}
                  >
                    Send
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default HelpDeskUser;
