using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace Jahan.Handicraft.Model.UModel
{
    public class IncomingCall : BaseEntity
    {
        [Required, StringLength(25, ErrorMessage = "Must be less than 25 character")]
        public string FullName { get; set; }

        [StringLength(15, ErrorMessage = "Must be less than 15 character")]
        public string ContactNumber { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [StringLength(50, ErrorMessage = "Must be less than 50 character")]
        public string Company { get; set; }

        [StringLength(100, ErrorMessage = "Must be less than 100 character")]
        public string Subject { get; set; }

        [Required, StringLength(1024, ErrorMessage = "Must be less than 1024 character")]
        public string TextMessage { get; set; }

        public string Reply { get; set; }
        public IncomingCall()
        {
        }

        public IncomingCall(IPublishedContent content) : base(content)
        {
            Initialize(content, null);
        }

        public IncomingCall(IPublishedContent content, CultureInfo culture) : base(content, culture)
        {
            Initialize(content, culture);
        }

        public override sealed void Initialize(IPublishedContent content, CultureInfo culture)
        {
            if (content != null)
            {
                FullName = content.GetPropertyValue<string>("FullName");
                ContactNumber = content.GetPropertyValue<string>("ContactNumber");
                Subject = content.GetPropertyValue<string>("Subject");
                Email = content.GetPropertyValue<string>("Email");
                //Company = content.GetPropertyValue<string>("Company");
                TextMessage = content.GetPropertyValue<string>("TextMessage");
                Reply = content.GetPropertyValue<string>("Reply");
            }
        }
    }
}
