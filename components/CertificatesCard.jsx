import { BiCalendar, BiCheck, BiLink } from "react-icons/bi";

const CertificatesCard = ({ certificate }) => {
  return (
    <div className="certificate-item">
      <div className="certificate-header">
        <h4>{certificate.title}</h4>
      </div>
      <div className="certificate-body">
        <p className="certificate-platform">{certificate.platform}</p>

        {certificate.link && (
          <a href={certificate.link} target="_blank" rel="noopener noreferrer">
            <BiLink />
            View Certificate
          </a>
        )}
      </div>
    </div>
  );
};

export default CertificatesCard;
