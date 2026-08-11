import { create } from "zustand";
import accountService from "../services/accountService";
import { Account, createAccountDTO, updateAccountDTO } from "../types/account";

interface AccountStore {
  accounts: Account[];
  defaultAccount: Account | null;
  loading: boolean;
  error: string | null;
  loadAccounts: () => Promise<void>;
  addAccount: (
    dto: createAccountDTO
  ) => Promise<boolean>;
  updateAccount: (
    id: number,
    dto: updateAccountDTO
  ) => Promise<boolean>;
  archiveAccount: (id: number) => Promise<boolean>;
  deleteAccount: (id: number) => Promise<boolean>;
}

export const useAccountStore =
create<AccountStore>((set, get) => ({
  accounts: [],
  defaultAccount: null,
  loading: false,
  error: null,
  async loadAccounts() {
    set({ loading: true, error: null });

    const accounts =
      await accountService.getAccounts();

    const defaultAccount =
      await accountService.getDefaultAccount();

    if (
      !accounts.success ||
      !defaultAccount.success
    ) {
      set({
        loading: false,
      });
      return;
    }

    set({
      loading: false,
      accounts: accounts.data,
      defaultAccount: defaultAccount.data,
      error: null,
    });
  },

  async addAccount(dto) {
    const result = await accountService.createAccount(dto);
    if(!result.success) {
      set({
        error: result.error.message,
      });
      return false;
    }
    await get().loadAccounts()

    return true;
  },

  async updateAccount(id, dto) {
    const result =
      await accountService.updateAccount(id, dto);

    if (!result.success) {
      set({
        error: result.error.message,
      });

      return false;
    }

    await get().loadAccounts();

    return true;
  },

  async archiveAccount(id) {
    const result = await accountService.archiveAccount(id);

    if (!result.success) {
      set({ error: result.error.message });
      return false;
    }

    await get().loadAccounts();
    return true;
  },

  async deleteAccount(id) {
    const result = await accountService.deleteAccount(id);

    if (!result.success) {
      set({ error: result.error.message });
      return false;
    }

    await get().loadAccounts();
    return true;
  },
}));