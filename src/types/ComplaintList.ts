export type Category = {
	id: string;
	adminId?: string;
	name?: string;
	description?: string;
	categoryId?: string;
	createdAt: string;
	updatedAt: string;
	status: string;
	complaints: Complaint[];
	studentId: string;
};

export type Complaint = {
	id: string;
	createdAt: string;
	date: string;
	updatedAt: string;
	name: string;
	title: string;
	description: string;
	status: string;
	categoryId: string;
	studentId: string;
	studentName?: string;
	departmentId?: string;
	assignedAdminId?: string;
	dateSubmitted: string;
	student?: {
		id: string;
		fullName: string;
		email: string;
		phone: string;
	};
	category?: Category;
};

export interface ComplaintListProps {
	selectedCategoryId: string | null;
	onSelectComplaint: (complaint: Complaint) => void;
	selectedComplaintId: string | null;
}
