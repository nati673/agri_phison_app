import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import ButtonBase from '@mui/material/ButtonBase';

// project-imports
import Logo from './LogoMain';
import LogoIcon from './LogoIcon';
import useAuth from 'hooks/useAuth';
import { APP_DEFAULT_PATH } from 'config';
import Clogo from './Logo.png';
import { useGetCompanyLogo } from 'api/company';
import { getSubdomain } from 'utils/redirectToSubdomain';

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection({ isIcon, sx, to }) {
  const { isLoggedIn } = useAuth();
  const subdomain = getSubdomain();

  const { companyLogo } = useGetCompanyLogo(subdomain);
  return (
    <ButtonBase disableRipple {...(isLoggedIn && { component: Link, to: !to ? APP_DEFAULT_PATH : to, sx })}>
      {companyLogo ? (
        <img src={`${import.meta.env.VITE_APP_API_URL}/tenant/logo/${companyLogo}`} width={224} alt="" />
      ) : (
        <img src={Clogo} alt="" width={220} />
      )}
    </ButtonBase>
  );
}

LogoSection.propTypes = { isIcon: PropTypes.bool, sx: PropTypes.any, to: PropTypes.any };
