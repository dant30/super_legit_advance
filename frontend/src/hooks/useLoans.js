// frontend/src/hooks/useLoans.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import {
  loanAPI,
  LOAN_STATUS,
  LOAN_APPLICATION_STATUS,
  LOAN_TYPE,
  getLoanStatusColor,
  formatCurrency
} from '@/api/loans';

/**
 * Custom hook for loan management using React Query
 */
export const useLoans = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [loanFilters, setLoanFilters] = useState({});
  const [applicationFilters, setApplicationFilters] = useState({});

  // ========== LOAN QUERIES ==========

  /**
   * Fetch all loans
   */
  const useLoansQuery = (filters = {}) => {
    return useQuery({
      queryKey: ['loans', { ...loanFilters, ...filters }],
      queryFn: () => loanAPI.getLoans({ ...loanFilters, ...filters }),
      staleTime: 1000 * 60 * 5, // 5 minutes
      keepPreviousData: true,
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to fetch loans',
          status: 'error'
        });
      }
    });
  };

  /**
   * Fetch single loan
   */
  const useLoanQuery = (id) => {
    return useQuery({
      queryKey: ['loan', id],
      queryFn: () => loanAPI.getLoan(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 10, // 10 minutes
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to fetch loan details',
          status: 'error'
        });
      }
    });
  };

  /**
   * Fetch loan statistics
   */
  const useLoanStatsQuery = () => {
    return useQuery({
      queryKey: ['loanStats'],
      queryFn: () => loanAPI.getLoanStats(),
      staleTime: 1000 * 60 * 2, // 2 minutes
      onError: (error) => {
        showToast({
          title: 'Error',
          description: 'Failed to fetch loan statistics',
          status: 'error'
        });
      }
    });
  };

  // ========== LOAN MUTATIONS ==========

  /**
   * Create loan mutation
   */
  const useCreateLoan = () => {
    return useMutation({
      mutationFn: (data) => loanAPI.createLoan(data),
      onSuccess: (data) => {
        queryClient.invalidateQueries(['loans']);
        showToast({
          title: 'Success',
          description: 'Loan created successfully',
          status: 'success'
        });
        return data;
      },
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to create loan',
          status: 'error'
        });
        throw error;
      }
    });
  };

  /**
   * Update loan mutation
   */
  const useUpdateLoan = () => {
    return useMutation({
      mutationFn: ({ id, data }) => loanAPI.updateLoan(id, data),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['loans']);
        queryClient.invalidateQueries(['loan', variables.id]);
        showToast({
          title: 'Success',
          description: 'Loan updated successfully',
          status: 'success'
        });
        return data;
      },
      onError: (error, variables) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to update loan',
          status: 'error'
        });
        throw error;
      }
    });
  };

  /**
   * Delete loan mutation
   */
  const useDeleteLoan = () => {
    return useMutation({
      mutationFn: (id) => loanAPI.deleteLoan(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries(['loans']);
        showToast({
          title: 'Success',
          description: 'Loan deleted successfully',
          status: 'success'
        });
      },
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to delete loan',
          status: 'error'
        });
        throw error;
      }
    });
  };

  /**
   * Approve loan mutation
   */
  const useApproveLoan = () => {
    return useMutation({
      mutationFn: ({ id, data }) => loanAPI.approveLoan(id, data),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['loans']);
        queryClient.invalidateQueries(['loan', variables.id]);
        showToast({
          title: 'Success',
          description: 'Loan approved successfully',
          status: 'success'
        });
        return data;
      },
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to approve loan',
          status: 'error'
        });
        throw error;
      }
    });
  };

  /**
   * Reject loan mutation
   */
  const useRejectLoan = () => {
    return useMutation({
      mutationFn: ({ id, reason }) => loanAPI.rejectLoan(id, reason),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['loans']);
        queryClient.invalidateQueries(['loan', variables.id]);
        showToast({
          title: 'Success',
          description: 'Loan rejected successfully',
          status: 'info'
        });
        return data;
      },
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to reject loan',
          status: 'error'
        });
        throw error;
      }
    });
  };

  /**
   * Disburse loan mutation
   */
  const useDisburseLoan = () => {
    return useMutation({
      mutationFn: ({ id, data }) => loanAPI.disburseLoan(id, data),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['loans']);
        queryClient.invalidateQueries(['loan', variables.id]);
        showToast({
          title: 'Success',
          description: 'Loan disbursed successfully',
          status: 'success'
        });
        return data;
      },
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to disburse loan',
          status: 'error'
        });
        throw error;
      }
    });
  };

  /**
   * Calculate loan mutation
   */
  const useCalculateLoan = () => {
    return useMutation({
      mutationFn: (data) => loanAPI.calculateLoan(data),
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to calculate loan terms',
          status: 'error'
        });
        throw error;
      }
    });
  };

  // ========== LOAN APPLICATION QUERIES ==========

  /**
   * Fetch loan applications
   */
  const useLoanApplicationsQuery = (filters = {}) => {
    return useQuery({
      queryKey: ['loanApplications', { ...applicationFilters, ...filters }],
      queryFn: () => loanAPI.getLoanApplications({ ...applicationFilters, ...filters }),
      staleTime: 1000 * 60 * 5, // 5 minutes
      keepPreviousData: true,
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to fetch loan applications',
          status: 'error'
        });
      }
    });
  };

  /**
   * Fetch single loan application
   */
  const useLoanApplicationQuery = (id) => {
    return useQuery({
      queryKey: ['loanApplication', id],
      queryFn: () => loanAPI.getLoanApplication(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 10, // 10 minutes
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to fetch loan application',
          status: 'error'
        });
      }
    });
  };

  // ========== LOAN APPLICATION MUTATIONS ==========

  /**
   * Create loan application mutation
   */
  const useCreateLoanApplication = () => {
    return useMutation({
      mutationFn: (data) => loanAPI.createLoanApplication(data),
      onSuccess: (data) => {
        queryClient.invalidateQueries(['loanApplications']);
        showToast({
          title: 'Success',
          description: 'Loan application created successfully',
          status: 'success'
        });
        return data;
      },
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to create loan application',
          status: 'error'
        });
        throw error;
      }
    });
  };

  /**
   * Submit loan application mutation
   */
  const useSubmitLoanApplication = () => {
    return useMutation({
      mutationFn: (id) => loanAPI.submitLoanApplication(id),
      onSuccess: (data, id) => {
        queryClient.invalidateQueries(['loanApplications']);
        queryClient.invalidateQueries(['loanApplication', id]);
        showToast({
          title: 'Success',
          description: 'Loan application submitted for review',
          status: 'success'
        });
        return data;
      },
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to submit loan application',
          status: 'error'
        });
        throw error;
      }
    });
  };

  /**
   * Approve loan application mutation
   */
  const useApproveLoanApplication = () => {
    return useMutation({
      mutationFn: ({ id, data }) => loanAPI.approveLoanApplication(id, data),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['loanApplications']);
        queryClient.invalidateQueries(['loanApplication', variables.id]);
        showToast({
          title: 'Success',
          description: 'Loan application approved',
          status: 'success'
        });
        return data;
      },
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to approve loan application',
          status: 'error'
        });
        throw error;
      }
    });
  };

  /**
   * Reject loan application mutation
   */
  const useRejectLoanApplication = () => {
    return useMutation({
      mutationFn: ({ id, reason }) => loanAPI.rejectLoanApplication(id, reason),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['loanApplications']);
        queryClient.invalidateQueries(['loanApplication', variables.id]);
        showToast({
          title: 'Success',
          description: 'Loan application rejected',
          status: 'info'
        });
        return data;
      },
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to reject loan application',
          status: 'error'
        });
        throw error;
      }
    });
  };

  // ========== COLLATERAL QUERIES ==========

  /**
   * Fetch collaterals for a loan
   */
  const useCollateralsQuery = (loanId, filters = {}) => {
    return useQuery({
      queryKey: ['collaterals', loanId, filters],
      queryFn: () => loanAPI.getCollaterals(loanId, filters),
      enabled: !!loanId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to fetch collaterals',
          status: 'error'
        });
      }
    });
  };

  // ========== COLLATERAL MUTATIONS ==========

  /**
   * Create collateral mutation
   */
  const useCreateCollateral = () => {
    return useMutation({
      mutationFn: ({ loanId, data }) => loanAPI.createCollateral(loanId, data),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['collaterals', variables.loanId]);
        showToast({
          title: 'Success',
          description: 'Collateral added successfully',
          status: 'success'
        });
        return data;
      },
      onError: (error) => {
        showToast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to add collateral',
          status: 'error'
        });
        throw error;
      }
    });
  };

  // ========== UTILITY FUNCTIONS ==========

  /**
   * Export loans
   */
  const exportLoans = useCallback(async (format = 'excel', filters = {}) => {
    try {
      const blob = await loanAPI.exportLoans(format, filters);
      const filename = `loans_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      loanAPI.downloadExport(blob, filename);
      showToast({
        title: 'Success',
        description: 'Loans exported successfully',
        status: 'success'
      });
      return true;
    } catch (error) {
      showToast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to export loans',
        status: 'error'
      });
      throw error;
    }
  }, [showToast]);

  /**
   * Search loans
   */
  const searchLoans = useCallback(async (query, searchType = 'basic') => {
    try {
      return await loanAPI.searchLoans(query, searchType);
    } catch (error) {
      showToast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to search loans',
        status: 'error'
      });
      throw error;
    }
  }, [showToast]);

  /**
   * Update loan filters
   */
  const updateLoanFilters = useCallback((filters) => {
    setLoanFilters(prev => ({ ...prev, ...filters }));
  }, []);

  /**
   * Update application filters
   */
  const updateApplicationFilters = useCallback((filters) => {
    setApplicationFilters(prev => ({ ...prev, ...filters }));
  }, []);

  /**
   * Clear all loan filters
   */
  const clearLoanFilters = useCallback(() => {
    setLoanFilters({});
  }, []);

  /**
   * Clear all application filters
   */
  const clearApplicationFilters = useCallback(() => {
    setApplicationFilters({});
  }, []);

  return {
    // Constants
    LOAN_STATUS,
    LOAN_APPLICATION_STATUS,
    LOAN_TYPE,
    getLoanStatusColor,
    formatCurrency,

    // State
    loanFilters,
    applicationFilters,

    // Loan Queries
    useLoansQuery,
    useLoanQuery,
    useLoanStatsQuery,

    // Loan Mutations
    useCreateLoan,
    useUpdateLoan,
    useDeleteLoan,
    useApproveLoan,
    useRejectLoan,
    useDisburseLoan,
    useCalculateLoan,

    // Application Queries
    useLoanApplicationsQuery,
    useLoanApplicationQuery,

    // Application Mutations
    useCreateLoanApplication,
    useSubmitLoanApplication,
    useApproveLoanApplication,
    useRejectLoanApplication,

    // Collateral Queries
    useCollateralsQuery,

    // Collateral Mutations
    useCreateCollateral,

    // Utility Functions
    exportLoans,
    searchLoans,
    updateLoanFilters,
    updateApplicationFilters,
    clearLoanFilters,
    clearApplicationFilters,
    
    // Validation
    validateLoanData: loanAPI.validateLoanData,
    calculateAffordability: loanAPI.calculateAffordability
  };
};

/**
 * Hook for loan-related utilities without React Query
 */
export const useLoanUtils = () => {
  const { showToast } = useToast();

  const calculateRepaymentProgress = (loan) => {
    if (!loan || !loan.amount_approved || !loan.outstanding_balance) return 0;
    const amountPaid = loan.amount_approved - loan.outstanding_balance;
    return (amountPaid / loan.amount_approved) * 100;
  };

  const getLoanAge = (loan) => {
    if (!loan || !loan.created_at) return 0;
    const created = new Date(loan.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getNextPaymentDate = (loan) => {
    if (!loan || !loan.next_payment_date) return null;
    return new Date(loan.next_payment_date);
  };

  const isLoanOverdue = (loan) => {
    if (!loan || !loan.next_payment_date) return false;
    const nextPayment = new Date(loan.next_payment_date);
    const today = new Date();
    return loan.status === LOAN_STATUS.ACTIVE && nextPayment < today;
  };

  const calculateTotalInterest = (loan) => {
    if (!loan || !loan.amount_approved || !loan.interest_rate || !loan.term_months) return 0;
    const monthlyRate = loan.interest_rate / 100 / 12;
    const totalInterest = loan.amount_approved * monthlyRate * loan.term_months;
    return totalInterest;
  };

  return {
    calculateRepaymentProgress,
    getLoanAge,
    getNextPaymentDate,
    isLoanOverdue,
    calculateTotalInterest,
    getLoanStatusColor,
    formatCurrency
  };
};

export default useLoans;