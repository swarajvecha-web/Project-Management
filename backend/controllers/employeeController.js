const Employee = require('../models/employees');

exports.createEmployee = async (req, res) => {
    try {
        const {
            employee_id, firstName, lastName, email, phone,
            residentialAddress, cnic, role, dateOfBirth, startDate, status, gender
        } = req.body;

        const existingEmployeeByEmail = await Employee.findOne({ email });
        if (existingEmployeeByEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const existingEmployeeByCnic = await Employee.findOne({ cnic });
        if (existingEmployeeByCnic) {
            return res.status(400).json({ message: 'CNIC already exists' });
        }

        const newEmployee = new Employee({
            employee_id, firstName, lastName, email, phone,
            residentialAddress, cnic, role, dateOfBirth, startDate, status, gender, user: req.user.userId
        });

        await newEmployee.save();
        res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
    } catch (error) {
        console.error('Create Employee Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ user: req.user.userId });
        res.status(200).json(employees);
    } catch (error) {
        console.error('Get Employees Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.params.id, user: req.user.userId });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json(employee);
    } catch (error) {
        console.error('Get Employee Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { email, cnic } = req.body;
        
        // Prevent updating to an existing email/cnic of ANOTHER employee
        if (email) {
            const existingEmail = await Employee.findOne({ email, _id: { $ne: req.params.id } });
            if (existingEmail) return res.status(400).json({ message: 'Email already exists' });
        }
        if (cnic) {
            const existingCnic = await Employee.findOne({ cnic, _id: { $ne: req.params.id } });
            if (existingCnic) return res.status(400).json({ message: 'CNIC already exists' });
        }

        const employee = await Employee.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, req.body, { new: true, runValidators: true });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json({ message: 'Employee updated successfully', employee });
    } catch (error) {
        console.error('Update Employee Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Delete Employee Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getEmployeeStats = async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments({ user: req.user.userId });
        const activeEmployees = await Employee.countDocuments({ status: 'Active', user: req.user.userId });
        const inActiveEmployees = await Employee.countDocuments({ status: 'In Active', user: req.user.userId });
        const terminatedEmployees = await Employee.countDocuments({ status: 'Terminated', user: req.user.userId });

        res.status(200).json({
            totalEmployees,
            activeEmployees,
            inActiveEmployees,
            terminatedEmployees,
        });
    } catch (error) {
        console.error('Get Employee Stats Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
