/**
 * CustomerProfileRepository — DEPRECATED
 * This file is kept for import compatibility only.
 * All new code should import from UserRepository.
 */
export { userRepository as customerProfileRepository } from "./UserRepository";
export type { IUser, IProfile, IUserWithProfile, IUserRepository } from "./UserRepository";
