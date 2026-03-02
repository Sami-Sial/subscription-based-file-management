export const success = (res, status = 200, message = "success", data = {}) => {
    return res.status(status).json({ success: true, message, data });
};

export const error = (res, status = 500, message = "Server Error", errors = []) => {
    return res.status(status).json({ success: false, message, errors });
};
