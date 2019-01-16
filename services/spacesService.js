const aws = require('aws-sdk');
const fs = require('fs');
const spacesEndpoint = new aws.Endpoint(process.env.spaces_endpoint);

const s3 = new aws.S3({
    accessKeyId : process.env.spaces_access_key,
    secretAccessKey : process.env.spaces_secret,
    endpoint: spacesEndpoint
});

const list = async (prefix) => {
  return new Promise((res, rej) => {
      s3.listObjects({Bucket : process.env.spaces_bucket, Delimiter : '/', Prefix : prefix}, (err, data) => {
         err ? rej(err) : res(data)
      });
  });
};

const putFile = async (input, outDir) => await putObject(fs.createReadStream(input), outDir);

const putBinary = async (binary, outDir) => await putObject(new Buffer(binary, 'binary'), outDir);

const putObject = async (data, outDir) => {
    return new Promise((res, rej) => {
        s3.putObject({
            Bucket: process.env.spaces_bucket,
            Key: outDir,
            Body: data
        }, function (err, data) {
            err ? rej(err) : res(data);
        });
    })
};

const deleteObject = async (path) => {
    return new Promise((res, rej) => {
        s3.deleteObject({Key : path, Bucket : process.env.spaces_bucket}, (err, data) => {
            return err ? rej(err) : res(data);           
        });
    })
};

const SpacesServices = {
    list,
    putFile,
    putBinary,
    putObject,
    deleteObject
};

module.exports = SpacesServices;
