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
    public class Photo : BaseEntity
    {
        public string Picture { get; set; }
        public string Description { get; set; }

        public Photo()
        {

        }
        public Photo(IPublishedContent content, CultureInfo culture) : base(content, culture)
        {
            Initialize(content, culture);
        }

        public Photo(IPublishedContent content) : base(content)
        {
            Initialize(content, null);
        }

        public override sealed void Initialize(IPublishedContent content, CultureInfo culture)
        {
            if (content != null)
            {
                Picture = content.GetPropertyValue<string>("Picture");
                Description = content.GetPropertyValue<string>("Description");
            }
        }
    }
}
