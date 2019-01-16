const aws = require('aws-sdk');
const fs = require('fs');
const {promisify} = require('util');

const s3 = new aws.S3({
    accessKeyId : process.env.spaces_access_key,
    secretAccessKey : process.env.spaces_secret,
    endpoint: new aws.Endpoint(process.env.spaces_endpoint)
});

const list = async (prefix) => {
  return await promisify(s3.listObjects({Bucket : process.env.spaces_bucket, Delimiter : '/', Prefix : prefix}));
};

const putFile = async (input, outDir) => await putObject(fs.createReadStream(input), outDir);

const putBinary = async (binary, outDir) => await putObject(new Buffer(binary, 'binary'), outDir);

const putObject = async (data, outDir) => {
    return await promisify(s3.putObject({
        Bucket: process.env.spaces_bucket,
        Key: outDir,
        Body: data
    }));
};

const deleteObject = async (path) => {
    return await promisify(s3.deleteObject({Key : path, Bucket : process.env.spaces_bucket});
};

const SpacesServices = {
    list,
    putFile,
    putBinary,
    putObject,
    deleteObject
};

module.exports = SpacesServices;
