import colors from 'colors';
import { User } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';


const superUser = {
  name: 'Abdullah Al Kafi',
  role: USER_ROLES.ADMIN,
  email: process.env.ADMIN_EMAIL || config.admin.email,
  password: process.env.ADMIN_PASSWORD || config.admin.password,
  address: 'Dhaka, Bangladesh',
  phone: '01711111111',
  image: 'https://i.ibb.co.com/2sw32KM/user.png',
  verified: true,
};

const seedAdmin = async () => {

  const isExistSuperAdmin = await User.findOne({
    role: 'admin',
  });


  if (!isExistSuperAdmin) {
    await User.create(superUser);
    console.log(colors.green('✔admin created successfully!'));
  }
};

export default seedAdmin;

