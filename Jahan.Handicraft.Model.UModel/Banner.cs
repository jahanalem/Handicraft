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
    public class Banner : BaseEntity
    {
        public virtual string Description { get; set; }

        public Banner()
        {

        }
        public Banner(IPublishedContent content, CultureInfo culture) : base(content, culture)
        {
            Initialize(content, culture);
        }

        public Banner(IPublishedContent content) : base(content)
        {
            Initialize(content, null);
        }
        public override sealed void Initialize(IPublishedContent content, CultureInfo culture)
        {
            if (content != null)
            {
                Description = content.GetPropertyValue("Description").ToString();
            }
        }
    }
}
