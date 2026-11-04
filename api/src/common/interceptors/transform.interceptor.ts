import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator.js';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T | null;
  timestamp: string;
}

const DEFAULT_METHOD_MESSAGES: Record<string, string> = {
  GET: 'Resource retrieved successfully',
  POST: 'Resource created successfully',
  PUT: 'Resource updated successfully',
  PATCH: 'Resource updated successfully',
  DELETE: 'Resource deleted successfully',
};

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private readonly reflector?: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const statusCode = httpContext.getResponse().statusCode;

    // Check if a custom message is defined via @ResponseMessage('...')
    const customMessage = this.reflector?.get<string>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        // Check if data is an object containing solely a 'message' property (e.g. { message: 'Logged out successfully' })
        const isMessageOnly =
          data &&
          typeof data === 'object' &&
          !Array.isArray(data) &&
          Object.keys(data).length === 1 &&
          'message' in data;

        const fallbackMessage =
          DEFAULT_METHOD_MESSAGES[request.method] || 'Operation successful';

        const message =
          customMessage ||
          (isMessageOnly
            ? (data as { message: string }).message
            : data?.message) ||
          fallbackMessage;

        const responseData = isMessageOnly ? null : (data ?? null);

        return {
          statusCode,
          message,
          data: responseData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
