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
    public class AboutUs : BaseEntity
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string MyPhoto { get; set; }
        public AboutUs()
        {
        }

        public AboutUs(IPublishedContent content, CultureInfo culture) : base(content, culture)
        {
            Initialize(content, culture);
        }

        public AboutUs(IPublishedContent content) : base(content)
        {
            Initialize(content, null);
        }
        public override sealed void Initialize(IPublishedContent content, CultureInfo culture)
        {
            if (content != null)
            {
                Title = content.GetPropertyValue<string>("Title");
                Description = content.GetPropertyValue<string>("Description");
                MyPhoto = content.GetPropertyValue<string>("MyPhoto");
            }
        }
    }
}
