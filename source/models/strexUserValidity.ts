/**
 * @enum unregistered. Not registered (0)
 * @enum partial. Registered, but not valid for licensed purchase (1)
 * @enum full. Registered and valid for licensed purchase (2)
 * @enum barred. Barred (3)
 */
export enum StrexUserValidity {
	unregistered = 0,
	partial = 1,
	full = 2,
	barred = 3
}