2025-12-06T00:05:55.670572051Z #17 10.30   The last overload gave the following error.
2025-12-06T00:05:55.670575351Z #17 10.30     Argument of type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670577601Z #17 10.30       Type 'import("/app/node_modules/@types/multer/node_modules/@types/express/index").RequestHandler<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>' is not assignable to type 'import("/app/node_modules/@types/express-serve-static-core/index").RequestHandler<import("/app/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670579851Z #17 10.30         Types of parameters 'req' and 'req' are incompatible.
2025-12-06T00:05:55.670582041Z #17 10.30           Type 'import("/app/node_modules/@types/express-serve-static-core/index").Request<import("/app/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>' is not assignable to type 'import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").Request<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670584181Z #17 10.30             The types of 'app.router' are incompatible between these types.
2025-12-06T00:05:55.670586641Z #17 10.30               Type 'string' is not assignable to type 'Router'.
2025-12-06T00:05:55.670600761Z #17 10.30 src/routes/businessDocument.routes.ts(39,24): error TS2769: No overload matches this call.
2025-12-06T00:05:55.670608622Z #17 10.30   The last overload gave the following error.
2025-12-06T00:05:55.670613672Z #17 10.30     Argument of type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670617562Z #17 10.30       Type 'import("/app/node_modules/@types/multer/node_modules/@types/express/index").RequestHandler<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>' is not assignable to type 'import("/app/node_modules/@types/express-serve-static-core/index").RequestHandler<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670620662Z #17 10.30         Types of parameters 'req' and 'req' are incompatible.
2025-12-06T00:05:55.670622812Z #17 10.30           Type 'import("/app/node_modules/@types/express-serve-static-core/index").Request<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>' is not assignable to type 'import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").Request<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670633962Z #17 10.30             The types of 'app.router' are incompatible between these types.
2025-12-06T00:05:55.670636152Z #17 10.30               Type 'string' is not assignable to type 'Router'.
2025-12-06T00:05:55.670638272Z #17 10.30 src/routes/fileUpload.routes.ts(38,24): error TS2769: No overload matches this call.
2025-12-06T00:05:55.670640442Z #17 10.30   The last overload gave the following error.
2025-12-06T00:05:55.670642633Z #17 10.30     Argument of type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670645142Z #17 10.30       Type 'import("/app/node_modules/@types/multer/node_modules/@types/express/index").RequestHandler<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>' is not assignable to type 'import("/app/node_modules/@types/express-serve-static-core/index").RequestHandler<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670647342Z #17 10.30         Types of parameters 'req' and 'req' are incompatible.
2025-12-06T00:05:55.670649513Z #17 10.30           Type 'import("/app/node_modules/@types/express-serve-static-core/index").Request<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>' is not assignable to type 'import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").Request<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670651643Z #17 10.30             The types of 'app.router' are incompatible between these types.
2025-12-06T00:05:55.670653773Z #17 10.30               Type 'string' is not assignable to type 'Router'.
2025-12-06T00:05:55.670655863Z #17 10.30 src/routes/productImage.routes.ts(35,3): error TS2769: No overload matches this call.
2025-12-06T00:05:55.670657983Z #17 10.30   The last overload gave the following error.
2025-12-06T00:05:55.670660103Z #17 10.30     Argument of type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670664343Z #17 10.30       Type 'import("/app/node_modules/@types/multer/node_modules/@types/express/index").RequestHandler<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>' is not assignable to type 'import("/app/node_modules/@types/express-serve-static-core/index").RequestHandler<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670666633Z #17 10.30         Types of parameters 'req' and 'req' are incompatible.
2025-12-06T00:05:55.670669543Z #17 10.30           Type 'import("/app/node_modules/@types/express-serve-static-core/index").Request<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>' is not assignable to type 'import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").Request<import("/app/node_modules/@types/multer/node_modules/@types/express-serve-static-core/index").ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>'.
2025-12-06T00:05:55.670675163Z #17 10.30             The types of 'app.router' are incompatible between these types.
2025-12-06T00:05:55.670677163Z #17 10.30               Type 'string' is not assignable to type 'Router'.
2025-12-06T00:05:55.670678943Z #17 10.36 Build completed with type errors (ignored for production)
2025-12-06T00:05:55.670681243Z #17 10.36 Done in 10.05s.
2025-12-06T00:06:23.147913866Z #17 DONE 38.0s
2025-12-06T00:06:23.262730444Z 
2025-12-06T00:06:23.262753524Z #18 [runner 4/8] COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist
2025-12-06T00:06:23.262760484Z #18 DONE 0.1s
2025-12-06T00:06:23.491017797Z 
2025-12-06T00:06:23.491043238Z #19 [runner 5/8] COPY --from=builder --chown=apiuser:nodejs /app/apps/api/package.json ./package.json
2025-12-06T00:06:23.491047658Z #19 DONE 0.1s
2025-12-06T00:06:23.491051308Z 
2025-12-06T00:06:23.491055018Z #20 [runner 6/8] COPY --from=deps --chown=apiuser:nodejs /app/node_modules ./node_modules
2025-12-06T00:06:26.317557371Z #20 DONE 3.0s
2025-12-06T00:06:26.469437616Z 
2025-12-06T00:06:26.469461336Z #21 [runner 7/8] COPY --from=deps --chown=apiuser:nodejs /app/apps/api/node_modules ./apps_api_modules
2025-12-06T00:06:26.625999583Z #21 DONE 0.3s
2025-12-06T00:06:26.850997007Z 
2025-12-06T00:06:26.851018908Z #22 [runner 8/8] RUN mkdir -p /app/public/invoices && chown -R apiuser:nodejs /app/public
2025-12-06T00:06:26.851023218Z #22 DONE 0.1s
2025-12-06T00:06:26.851026788Z 
2025-12-06T00:06:26.851030868Z #23 exporting to docker image format
2025-12-06T00:06:26.851034498Z #23 exporting layers
2025-12-06T00:06:32.701891199Z #23 exporting layers 6.0s done
2025-12-06T00:06:32.868614509Z #23 exporting manifest sha256:c64208b493b9969b57b1a38c3e6242fe77cd87372ab57e897371f37e40abd299 done
2025-12-06T00:06:32.86863927Z #23 exporting config sha256:323bc85ae2e953422676ad1e751bdc79d3020a7173d1b2b615d5c186820ddc2c done
2025-12-06T00:06:33.23218592Z #23 DONE 6.5s
2025-12-06T00:06:33.410142119Z 
2025-12-06T00:06:33.410159389Z #24 exporting cache to client directory
2025-12-06T00:06:33.41016567Z #24 preparing build cache for export
2025-12-06T00:07:05.198071527Z #24 writing cache image manifest sha256:608187dc1cebaeccb21bee8bd76967169166fb6a82c383af9bcd9bcd81815f35 0.0s done
2025-12-06T00:07:05.198107708Z #24 DONE 31.9s
2025-12-06T00:07:06.077060613Z Pushing image to registry...
2025-12-06T00:07:10.693551226Z Upload succeeded
2025-12-06T00:07:13.231032743Z ==> Deploying...
2025-12-06T00:07:24.720375924Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:24.721043349Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:24.81613301Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:24.816160281Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:24.8238121Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:24.823951147Z Orange Money credentials not fully configured. Set ORANGE_MONEY_CLIENT_ID, ORANGE_MONEY_CLIENT_SECRET, and ORANGE_MONEY_MERCHANT_CODE
2025-12-06T00:07:25.915069893Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:25.915090274Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:25.917922685Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:25.917943956Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:25.919300289Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:25.919463027Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:27.122686413Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:27.122713904Z [FLW] baseUrl=https://api.flutterwave.com/v3 token=FLWSECK_...97-X
2025-12-06T00:07:27.317986657Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"name":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2025-12-06T00:07:27.31804552Z (Use `node --trace-warnings ...` to show where the warning was created)
2025-12-06T00:07:27.31805047Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"code":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2025-12-06T00:07:27.318063261Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"userId":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2025-12-06T00:07:27.318218509Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"reference":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2025-12-06T00:07:27.31823452Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"externalReference":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2025-12-06T00:07:27.318343826Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"reference":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2025-12-06T00:07:27.318352196Z (node:1) [MONGOOSE] Warning: Duplicate schema index on {"userId":1,"status":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
2025-12-06T00:07:28.928325144Z 🚀 MongoDB connected successfully
2025-12-06T00:07:28.930115109Z 🌐 Server running in production mode on port 5000
2025-12-06T00:07:28.93012838Z 📚 API Documentation: http://localhost:5000/api-docs
2025-12-06T00:07:28.93013401Z 🔒 Security: Helmet enabled
2025-12-06T00:07:28.930148921Z 📝 Logging: Morgan combined mode
2025-12-06T00:07:29.114634438Z ::1 - - [06/Dec/2025:00:07:29 +0000] "HEAD / HTTP/1.1" 200 111 "-" "Go-http-client/1.1"
2025-12-06T00:07:33.810506237Z ==> Your service is live 🎉
2025-12-06T00:07:33.894325111Z ==> 
2025-12-06T00:07:33.977142914Z ==> ///////////////////////////////////////////////////////////
2025-12-06T00:07:34.058927008Z ==> 
2025-12-06T00:07:34.141620582Z ==> Available at your primary URL https://glotrade-ecom.onrender.com
2025-12-06T00:07:34.224916485Z ==> 
2025-12-06T00:07:34.307621499Z ==> ///////////////////////////////////////////////////////////
2025-12-06T00:07:35.752769191Z ::1 - - [06/Dec/2025:00:07:35 +0000] "GET / HTTP/1.1" 200 111 "-" "Go-http-client/2.0"