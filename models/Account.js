module.exports = function(config, mongoose, nodemailer) {
    const crypto = require('crypto');
    const AccountSchema = new mongoose.Schema({
        email: { type: String, unique: true },
        password: { type: String },
        name: {
            first: { type: String },
            last: { type: String }
        },
        birthday: {
            day: { type: Number, min: 1, max: 31, required: false },
            month: { type: Number, min: 1, max: 12, required: false },
            year: { type: Number }
        },
        photoUrl: { type: String },
        biography: { type: String }
    });
    const Account = mongoose.model('Account', AccountSchema);

    const registerCallback = function(err) {
        if (err) {
            return console.log(err);
        };
        return console.log('Account was created');
    };
    
    const changePassword = function(accountId, newpassword) {
        const shaSum = crypto.createHash('sha256');
        shaSum.update(newpassword);
        const hashedPassword = shaSum.digest('hex');
        Account.update({_id:accountId}, {$set: {password:hashedPassword}},{upsert:false},
            function changePasswordCallback(err) {
                console.log('Change password done for account ' + accountId);
            });
        };
        const forgotPassword = function(email, resetPasswordUrl, callback) {
            const user = Account.findOne({email: email}, function findAccount(err, doc){
                if (err) {
                    // Email address is not a valid user
                    callback(false);
                } else {
                    const smtpTransport = nodemailer.createTransport('SMTP', config.mail);
                    resetPasswordUrl += '?account=' + doc._id;
                    smtpTransport.sendMail({
                        from: 'thisapp@example.com',
                        to: doc.email,
                        subject: 'SocialNet Password Request',
                        text: 'Click here to reset your password: ' + resetPasswordUrl
                    }, function forgotPasswordResult(err) {
                        if (err) {
                            callback(false);
                        } else {
                            callback(true);
                        }
                    });
                }
            });
        };
        const login = function(email, password, callback) {
            var shaSum = crypto.createHash('sha256');
            shaSum.update(password);
            Account.findOne({email:email,password:shaSum.digest('hex')},function(err,doc){
                callback(null!=doc);
            });
        };
        const register = function(email, password, firstName, lastName) {
            var shaSum = crypto.createHash('sha256');
            shaSum.update(password);
            console.log('Registering ' + email);
            var user = new Account({
                email: email,
                name: {
                    first: firstName,
                    last: lastName
                },
                password: shaSum.digest('hex')
            });
            user.save(registerCallback);
            console.log('Save command was sent');
        }
        return {
            register: register,
            forgotPassword: forgotPassword,
            changePassword: changePassword,
            login: login,
            Account: Account
        }
    }