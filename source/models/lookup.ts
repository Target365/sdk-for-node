/** 
 *  @property created. Created time.
 *  @property msisdn. Msisdn.
 *  @property landline. Landline phone number.
 *  @property firstName. First name.
 *  @property middleName. Middle name.
 *  @property lastName. Last name.
 *  @property companyName. Company name.
 *  @property companyOrgNo. Company organization number.
 *  @property streetName. Street name.
 *  @property streetNumber. Street number.
 *  @property streetLetter. Street letter.
 *  @property zipCode. Zip code.
 *  @property city. City.
 *  @property gender. Gender, 'M' for male, 'F' for female and 'U' for unknown.
 *  @property dateOfBirth. Date of birth, in format 'yyyy-dd-MM'.
 *  @property age. Age.
 *  @property deceasedDate. Deceased date, in format 'yyyy-dd-MM'.
 */
export default interface Lookup {
	created: Date;
	msisdn: string;
	landline: string;
	firstName: string;
	middleName: string;
	lastName: string;
	companyName: string;
	companyOrgNo: string;
	streetName: string;
	streetNumber: string;
	streetLetter: string;
	zipCode: string;
	city: string;
	gender: string;
	dateOfBirth: string;
	age?: number;
	deceasedDate: string;
}