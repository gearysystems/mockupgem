'use strict'

const imageUpload = require('./image_upload');
const mockupMetadataHandlers = require('./get_mockup_metadata_handler');
const mockupMetadata = require('./mockup_metadata.js');
const screenshots = require('./screenshots.js');
const mockups = require('./mockups.js');
const adminHandlers = require('./admin.js');
const express = require('express');

const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  info: {
    title: 'MockupGem API',
    version: '1.0.0',
    description: 'Documentation for using the MockupGem API.',
  },
  host: 'mockupgem.gearysystems.com',
  basepath: '/',
}

const options = {
  swaggerDefinition: swaggerDefinition,
  // Based on path from app.js
  apis: ['./lib/*.js'],
}

const swaggerSpec = swaggerJSDoc(options);

function setupRoutes(app) {
  // Serve swagger specs
  app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Serve static files
  app.use(express.static(__dirname + '/../public'));

  // Admin endpoints for adding new templates
  app.get('/admin/templates', adminHandlers.getAdminTemplates);
  app.post('/admin/templates', adminHandlers.addTemplateUploadMiddleware, adminHandlers.postAdminTemplates);

  // Single-endpoint mockup generation - Undocumented for now
  app.post('/api/v1/upload', imageUpload.imageUploadMiddleware, imageUpload.imageUploadHandler);

  /**
   * @swagger
   * definition:
   *   screenshot:
   *     properties:
   *       uuid:
   *         type: string
   *       url:
   *         type: string
   *   invalid_screenshot_upload_request_error:
   *     properties:
   *       error_code:
   *         type: string
   *         enum:
   *           - "invalid_screenshot_upload"
   *       error_message:
   *         type: string
   *         enum:
   *           - "A screenshot must be provided."
   */

  /**
   * @swagger
   * /api/v1/screenshots:
   *   post:
   *     tags:
   *       - screenshots
   *     description: Upload a screenshot which can be used to generate mockups from templates.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: screenshot
   *         description: Screenshot image
   *         in: formData
   *         required: true
   *         type: file
   *     responses:
   *       200:
   *         description: Screenshot metadata
   *         schema:
   *           $ref: '#/definitions/screenshot'
   *       400:
   *          description: Invalid screenshot upload request
   *          schema:
   *            $ref: '#/definitions/invalid_screenshot_upload_request_error'
   */
  app.post('/api/v1/screenshots', screenshots.screenshotUploadMiddleware, screenshots.screenshotUploadHandler);

  /**
  * @swagger
  * definition:
  *   templates_request:
  *      properties:
  *        templates:
  *          type: array
  *          items:
  *            type: string
  */

  /**
   * @swagger
   * /api/v1/screenshots/{screenshot_uuid}/mockups:
   *   post:
   *     tags:
   *       - screenshots
   *     description: Generate mockups for a screenshot thats already been uploaded
   *     produces:
   *       - application/json
   *     consumes:
   *      - application/json
   *     parameters:
   *       - name: screenshot_uuid
   *         description: UUID of the screenshot to use for generating mockups.
   *         in: path
   *         required: true
   *         type: string
   *       - name: templates
   *         description: Templates for which to generate mockups.
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/templates_request'
   *     responses:
   *       200:
   *         description: Screenshot metadata
   *         schema:
   *           $ref: '#/definitions/screenshot'
   *       400:
   *          description: Invalid create mockups request
   *          schema:
   *            $ref: '#/definitions/invalid_create_mockups_request_error'
   *       500:
   *          description: Something went wrong on our end!
   *          schema:
   *            $ref: '#/definitions/create_mockups_error'
   */
  app.post('/api/v1/screenshots/:screenshotUUID/mockups', mockups.createMockupsHandler);

  /**
   * @swagger
   * definition:
   *   templates:
   *     type: array
   *     items:
   *       $ref: '#/definitions/template'
   *   templates-by-name:
   *     type: object
   *     additionalProperties: {}
   *   templates-by-device:
   *     type: array
   *     items:
   *       $ref: '#/definitions/template'
   *   template:
   *     properties:
   *       mockup_name:
   *         type: string
   *       device:
   *         type: string
   *       full_image_url:
   *         type: string
   *       thumbnail_1200_1200_url:
   *         type: string
   *       thumbnail_800_800_url:
   *         type: string
   *       thumbnail_600_600_url:
   *         type: string
   *       thumbnail_400_400_url:
   *         type: string
   */

  /**
   * @swagger
   * /api/v1/templates:
   *   get:
   *     tags:
   *       - templates
   *     description: Return JSON representing all available templates
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Templates metadata
   *         schema:
   *           $ref: '#/definitions/templates'
   */
  app.get('/api/v1/templates', mockupMetadataHandlers.getMockupMetadataHandler);

  /**
   * @swagger
   * /api/v1/templates-by-name:
   *   get:
   *     tags:
   *       - templates
   *     description: Return JSON representing all available templates, keyed by name.
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Templates metadata by name
   *         schema:
   *           $ref: '#/definitions/templates-by-name'
   */
  app.get('/api/v1/templates-by-name', mockupMetadataHandlers.getMockupMetadataByNameHandler);

  /**
   * @swagger
   * /api/v1/templates-by-device:
   *   get:
   *     tags:
   *       - templates
   *     description: Return JSON representing all available templates, keyed by device.
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Templates metadata by device
   *         schema:
   *           $ref: '#/definitions/templates-by-device'
   */
  app.get('/api/v1/templates-by-device', mockupMetadataHandlers.getMockupMetadataByDeviceHandler);
}

module.exports = {
  setupRoutes: setupRoutes,
}
