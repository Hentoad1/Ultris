const mailer = require('@sendgrid/mail');
mailer.setApiKey(process.env.SENDGRID_API_KEY);

function emailVerifyLink(options){
  return new Promise((resolve, reject) => {
    if (options.username === undefined){
      reject(new Error('username is undefined'));
    }

    if (options.link === undefined){
      reject(new Error('link is undefined'));
    }

    let payload = {
      to: (options.to),
      from: {
        email:"support-noreply@ultris.io",
        name:"Ultris Support"
      },
      templateId:'d-6846f78b00f841d88b2700adedc5fc78',
      dynamicTemplateData:{
        subject:'Verify your email address',
        username:options.username,
        link:options.link
      }
    }

    mailer.send(payload).then(resolve).catch(reject);
  })
}


function emailVerifyCode(options){
  return new Promise((resolve, reject) => {
    if (options.code === undefined){
      reject(new Error('code is undefined'));
    }

    let payload = {
      to: (options.to),
      from: {
        email:"support-noreply@ultris.io",
        name:"Ultris Support"
      },
      templateId:'d-6ae9ea96ca3c47c9a0fe0ebf7303a696',
      dynamicTemplateData:{
        subject:`Login code: ${options.code}`,
        code:options.code
      }
    }

    mailer.send(payload).then(resolve).catch(reject);
  })
}

function emailResetLink(options){
  return new Promise((resolve, reject) => {
    if (options.username === undefined){
      reject(new Error('username is undefined'));
    }

    if (options.link === undefined){
      reject(new Error('link is undefined'));
    }

    let payload = {
      to: (options.to),
      from: {
        email:"support-noreply@ultris.io",
        name:"Ultris Support"
      },
      templateId:'d-078438ab6240482bb71205a8087a901b',
      dynamicTemplateData:{
        subject:'Reset Password',
        username:options.username,
        link:options.link
      }
    }

    mailer.send(payload).then(resolve).catch(reject);
  })
}

module.exports = {emailVerifyLink, emailVerifyCode, emailResetLink}