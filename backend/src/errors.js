import { ZodError } from 'zod';

// An error that is safe to show to the caller.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: { message: `No route for ${req.method} ${req.path}` } });
}

// Express recognises error handlers by their four arguments.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
    return res.status(400).json({ error: { message: 'Invalid request', details } });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Request body is not valid JSON' } });
  }
  console.error(err);
  res.status(500).json({ error: { message: 'Something went wrong on our side' } });
}
