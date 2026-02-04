import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSuiExplorerLink(
  network: 'mainnet' | 'testnet' | 'devnet',
  type: 'transaction' | 'object' | 'address',
  id: string
): string {
  return `https://suiexplorer.com/${type}/${id}?network=${network}`;
}
