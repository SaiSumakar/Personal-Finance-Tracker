import accountRepository from "../db/repositories/accountRepository";
import { ErrorCodes } from "../constants/errorCodes";
import { ServiceResult } from "../types/result";
import { success, failure } from "../utils/result";
import { Account, createAccountDTO, updateAccountDTO } from "../types/account";

class AccountService {
  async getAccounts(): Promise<ServiceResult<Account[]>> {
    try {
      const accounts = await accountRepository.getAll();
      return success(accounts);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error ? error.message : "Failed to load accounts."
      );
    }
  }

  async getDefaultAccount(): Promise<ServiceResult<Account | null>> {
    try {
      const account = await accountRepository.getDefault();
      return success(account);
    } catch (error) {
      return failure(
        ErrorCodes.DATABASE_ERROR,
        error instanceof Error ? error.message : "Failed to load default account."
      );
    }
  }

  async createAccount(
    dto: createAccountDTO
  ): Promise<ServiceResult<Account>> {
    try {
      const account = await accountRepository.create(dto);

      if (!account) {
        return failure(
          ErrorCodes.DATABASE_ERROR,
          "Account was created but could not be loaded."
        );
      }

      return success(account);
    } catch (error) {
      return failure(
        ErrorCodes.UNKNOWN_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to create account."
      );
    }
  }

  async updateAccount(
    id: number,
    dto: updateAccountDTO
  ): Promise<ServiceResult<Account | null>> {
    try {
      const result = await accountRepository.update(id, dto);

      return success(result);
    } catch (error) {
      return failure(
        ErrorCodes.UNKNOWN_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to update account."
      );
    }
  }

  async archiveAccount(id: number): Promise<ServiceResult<boolean>> {
    try {
      const result = await accountRepository.archive(id);
      return success(result);
    } catch (error) {
      return failure(
        ErrorCodes.UNKNOWN_ERROR,
        error instanceof Error ? error.message : "Failed to archive account."
      );
    }
  }

  async deleteAccount(id: number): Promise<ServiceResult<boolean>> {
    try {
      const result = await accountRepository.delete(id);
      return success(result);
    } catch (error) {
      return failure(
        ErrorCodes.UNKNOWN_ERROR,
        error instanceof Error ? error.message : "Failed to delete account."
      );
    }
  }
}

export default new AccountService();