import { useRef, useState } from 'react';
import Buttons from '../components/buttons/Buttons';
import { currentDate5, pageTitle } from 'utils/invoice.helper';
import QRCode from 'react-qr-code';
import InvoiceToPayTo from '../components/invoiceToPayTo/InvoiceToPayTo';
import { Call, Location, Shop, Verify } from 'iconsax-react';
import { Avatar } from '@mui/material';
import SimpleSignaturePad from '../components/SimpleSignaturePad';
import SignatureInput from '../components/SignatureDemo';

export default function StockTransferInvoice({ data, grandTotal }) {
  const invoicePage = useRef();
  const formattedDate = new Date(data.transfer_date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const getLogoUrl = (logo) => (logo ? `${import.meta.env.VITE_APP_API_URL}/tenant/logo/${logo}` : undefined);
  const birrFormatter = new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2
  });
  const [signatureImg, setSignatureImg] = useState('');

  return (
    <>
      <Buttons invoicePage={invoicePage} />

      <div className="tm_invoice tm_style1 tm_type2" id="tm_download_section" ref={invoicePage}>
        <div className="tm_bars">
          <span className="tm_accent_bg" />
          <span className="tm_accent_bg" />
          <span className="tm_accent_bg" />
        </div>

        <div className="tm_shape">
          <div className="tm_shape_in tm_accent_bg" />
        </div>

        <div className="tm_invoice_in">
          <div className="tm_invoice_left">
            <div style={{ alignItems: 'center' }}>
              {data.company_logo && <img src={getLogoUrl(data.company_logo)} alt={data.company_name} width={300} />}
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{data.company_name}</div>
                {data.company_address && <div style={{ color: '#555', fontSize: 15 }}>{data.company_address}</div>}
                {data.company_phone && <div style={{ color: '#555', fontSize: 15 }}>Tel: {data.company_phone}</div>}
                {data.website && (
                  <div style={{ color: '#555', fontSize: 15 }}>
                    <a href={data.website} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2', textDecoration: 'none' }}>
                      {data.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="tm_invoice_info tm_mb20">
            <div className="tm_logo" style={{ marginTop: 18 }}>
              <h1 style={{ fontWeight: 700, fontSize: 32 }}>Stock Transfer Note</h1>
            </div>
            <div className="tm_invoice_info_list">
              <p className="tm_invoice_date tm_m0">
                Date: <b className="tm_primary_color">{formattedDate}</b>
              </p>
              <p className="tm_invoice_number tm_m0">
                Invoice No: <b className="tm_primary_color">{data.invoice_number}</b>
              </p>
              <br />
            </div>
          </div>
          <div className="tm_invoice_head tm_mb10">
            <div className="tm_invoice_left">
              <p className="tm_mb2">
                <b className="tm_primary_color">Transfer From</b>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Shop size={16} style={{ marginRight: 8 }} color="#73C938" />
                <span style={{ fontWeight: 500 }}>{data.from_location_name}</span>
              </div>
              {data.from_location_address && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <Location size={16} style={{ marginRight: 8, opacity: 0.7 }} color="#73C938" />
                  <span>{data.from_location_address}, Ethiopia</span>
                </div>
              )}
              {data.from_location_phone_number && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <Call size={16} style={{ marginRight: 8 }} color="#73C938" />
                  <span>Tel: {data.from_location_phone_number}</span>
                </div>
              )}
            </div>

            <div>
              <p className="tm_mb2">
                <b className="tm_primary_color">Transferred To</b>
              </p>
              <div style={{ display: 'end', alignItems: 'center', marginBottom: 4 }}>
                <Shop size={16} style={{ marginRight: 8 }} color="#73C938" />
                <span style={{ fontWeight: 500 }}>{data.to_location_name}</span>
              </div>
              {data.to_location_address && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <Location size={16} style={{ marginRight: 8, opacity: 0.7 }} color="#73C938" />
                  <span>{data.to_location_address}, Ethiopia</span>
                </div>
              )}
              {data.to_location_phone_number && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <Call size={16} style={{ marginRight: 8 }} color="#73C938" />
                  <span>Tel: {data.to_location_phone_number}</span>
                </div>
              )}
            </div>
          </div>
          <div className="tm_table tm_style1 tm_mb30">
            <div className="tm_mb30">
              <div className="tm_table_responsive">
                <table className="tm_border_bottom">
                  <thead>
                    <tr>
                      <th className="tm_width_2  tm_white_color tm_accent_bg">SKU</th>
                      <th className="tm_width_6  tm_white_color tm_accent_bg">Item</th>
                      <th className="tm_width_2  tm_white_color tm_accent_bg">Price</th>
                      <th className="tm_width_1  tm_white_color tm_accent_bg tm_text_center">Qty</th>
                      <th className="tm_width_2  tm_white_color tm_accent_bg tm_text_right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="tm_width_1 tm_text_left">{item.sku}</td>
                        <td className="tm_width_6">
                          {item.product_name} {item.volume ? `(${item.volume})` : ''}
                        </td>
                        <td className="tm_width_2">{birrFormatter.format(item.selling_price)}</td>
                        <td className="tm_width_1 tm_text_center">{item.quantity}</td>
                        <td className="tm_width_2 tm_text_right">
                          {birrFormatter.format((item.selling_price * item.quantity).toFixed(2))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className="tm_invoice_footer"
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32 }}
            >
              <div className="tm_left_footer" style={{ maxWidth: 300, wordBreak: 'break-word' }}>
                {data.note && (
                  <p
                    className="tm_invoice_note"
                    style={{
                      marginBottom: 12,
                      fontSize: 15,
                      fontStyle: 'italic',
                      color: '#555'
                    }}
                  >
                    <b>Note:</b> {data.note}
                  </p>
                )}
                <div>
                  <div style={{ marginBottom: 8, fontWeight: 600, color: '#888' }}>
                    Scan to verify <Verify size="11" color="#2BA735" />
                  </div>
                  <QRCode value={data.invoice_access_token} size={93} />
                </div>
              </div>

              <div className="tm_right_footer" style={{ minWidth: 320, paddingLeft: 9 }}>
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td className="tm_width_3 tm_accent_color tm_border_none tm_bold">SubTotal</td>
                      <td className="tm_width_3 tm_accent_color tm_text_right tm_border_none tm_bold">
                        {birrFormatter.format(grandTotal)}
                      </td>
                    </tr>
                    <tr>
                      <td className="tm_width_3 tm_accent_color tm_border_none tm_pt0">
                        Tax <span className="tm_accent_color">(0%)</span>
                      </td>
                      <td className="tm_width_3 tm_accent_color tm_text_right tm_border_none tm_pt0">+ ETB O</td>
                    </tr>
                    <tr className="tm_border_top tm_border_bottom">
                      <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_accent_color">Grand Total</td>
                      <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_accent_color tm_text_right">
                        {birrFormatter.format(grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="tm_shape_3 tm_accent_bg_10" />
              </div>
            </div>

            <div
              className="tm_signatures_section"
              style={{ marginTop: '-110px', marginBottom: '110px', display: 'flex', justifyContent: 'space-between', gap: '40px' }}
            >
              {/* Transferred By */}
              <div style={{ textAlign: 'left', minWidth: 250 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 20 }}>Transferred By</div>
                <div style={{ marginBottom: 20 }}>
                  Name:{' '}
                  <span
                    style={{
                      borderBottom: '1px solid #444',
                      display: 'inline-block',
                      minWidth: 120
                    }}
                  >
                    {data.transferred_by_name || ''}
                  </span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  Date:{' '}
                  <span
                    style={{
                      borderBottom: '1px solid #444',
                      display: 'inline-block',
                      minWidth: 120
                    }}
                  >
                    {formattedDate || ''}
                  </span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  Signature:
                  <SignatureInput label="Approved By" name={data.approved_by_name || ''} date={data.approved_date || ''} />
                </div>
              </div>
              {/* Received By */}
              <div style={{ textAlign: 'left', minWidth: 250 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 20 }}>Received By</div>
                <div style={{ marginBottom: 20 }}>
                  Name:{' '}
                  <span
                    style={{
                      borderBottom: '1px solid #444',
                      display: 'inline-block',
                      minWidth: 120
                    }}
                  >
                    {data.received_by_name || data.assigned_to_name || ''}
                  </span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  Date:{' '}
                  <span
                    style={{
                      borderBottom: '1px solid #444',
                      display: 'inline-block',
                      minWidth: 120
                    }}
                  >
                    {data.received_date || ''}
                  </span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  Signature:
                  <SignatureInput label="Approved By" name={data.approved_by_name || ''} date={data.approved_date || ''} />
                </div>
              </div>

              {/* Approved By */}
              <div style={{ textAlign: 'left', minWidth: 250 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 20 }}>Approved By</div>
                <div style={{ marginBottom: 20 }}>
                  Name:{' '}
                  <span
                    style={{
                      borderBottom: '1px solid #444',
                      display: 'inline-block',
                      minWidth: 120
                    }}
                  >
                    {data.approved_by_name || ''}
                  </span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  Date:{' '}
                  <span
                    style={{
                      borderBottom: '1px solid #444',
                      display: 'inline-block',
                      minWidth: 120
                    }}
                  >
                    {data.approved_date || ''}
                  </span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  Signature:
                  <SignatureInput label="Approved By" name={data.approved_by_name || ''} date={data.approved_date || ''} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
