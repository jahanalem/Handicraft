using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace Jahan.Handicraft.Model.UModel
{
    public class ContactUs : BaseEntity
    {
        public string Telephone { get; set; }
        public string Mobile { get; set; }
        public string Fax { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public ContactUs()
        {
        }

        public ContactUs(IPublishedContent content, CultureInfo culture) : base(content, culture)
        {
            Initialize(content, culture);
        }

        public ContactUs(IPublishedContent content) : base(content)
        {
            Initialize(content, null);
        }
        public override sealed void Initialize(IPublishedContent content, CultureInfo culture)
        {
            if (content != null)
            {
                Telephone = content.GetPropertyValue<string>("Telephone");
                Mobile = content.GetPropertyValue<string>("Mobile");
                Fax = content.GetPropertyValue<string>("Fax");
                Email = content.GetPropertyValue<string>("Email");
                Address = content.GetPropertyValue<string>("Address");
                Title = content.GetPropertyValue<string>("Title");
                Description = content.GetPropertyValue<string>("Description");
            }
        }
    }
}
