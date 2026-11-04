import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

/**
 * Creates an OpenAPI schema matching the TransformInterceptor response envelope
 */
const createEnvelopedSchema = <TModel extends Type<any>>(
  model?: TModel,
  statusCode = 200,
) => {
  return {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: statusCode },
      message: { type: 'string', example: 'Success' },
      data: model
        ? { $ref: getSchemaPath(model) }
        : { type: 'object', nullable: true, example: null },
      timestamp: {
        type: 'string',
        example: '2026-11-04T00:00:00.000Z',
      },
    },
  };
};

/**
 * Common API responses for standard operations
 */
export const ApiStandardResponses = () => {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'Bad Request - Validation failed' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid credentials' }),
    ApiInternalServerErrorResponse({ description: 'Internal Server Error' }),
    ApiTooManyRequestsResponse({ description: 'Too Many Requests' }),
  );
};

/**
 * API responses for CREATE operations
 */
export const ApiCreateResponses = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: 201,
      description: 'Resource created successfully',
      schema: createEnvelopedSchema(model, 201),
    }),
    ApiConflictResponse({ description: 'Conflict - Resource already exists' }),
    ApiStandardResponses(),
  );
};

/**
 * API responses for READ operations (single item)
 */
export const ApiReadResponses = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: 'Resource retrieved successfully',
      schema: createEnvelopedSchema(model, 200),
    }),
    ApiNotFoundResponse({ description: 'Resource not found' }),
    ApiStandardResponses(),
  );
};

/**
 * API responses for READ operations (paginated list)
 */
export const ApiListResponses = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: 'Resources retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              total: { type: 'number', example: 100 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 10 },
            },
          },
          timestamp: {
            type: 'string',
            example: '2026-11-04T00:00:00.000Z',
          },
        },
      },
    }),
    ApiStandardResponses(),
  );
};

/**
 * API responses for UPDATE operations
 */
export const ApiUpdateResponses = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: 'Resource updated successfully',
      schema: createEnvelopedSchema(model, 200),
    }),
    ApiNotFoundResponse({ description: 'Resource not found' }),
    ApiStandardResponses(),
  );
};

/**
 * API responses for DELETE operations
 */
export const ApiDeleteResponses = () => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Resource deleted successfully',
      schema: createEnvelopedSchema(undefined, 200),
    }),
    ApiNotFoundResponse({ description: 'Resource not found' }),
    ApiStandardResponses(),
  );
};

/**
 * API responses for Authentication operations
 */
export const ApiAuthResponses = <TModel extends Type<any>>(
  model: TModel,
  statusCode = 200,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: statusCode,
      description: 'Authentication successful',
      schema: createEnvelopedSchema(model, statusCode),
    }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
    ApiConflictResponse({ description: 'User already exists' }),
    ApiStandardResponses(),
  );
};
