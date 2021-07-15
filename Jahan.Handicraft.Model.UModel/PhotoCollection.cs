using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace Jahan.Handicraft.Model.UModel
{
    public class PhotoCollection : BaseEntity
    {
        public bool UmbracoNaviHide { get; set; }
        public List<Photo> PhotoList { get; set; }
        protected PhotoCollection()
        {
        }
        protected PhotoCollection(IPublishedContent content, CultureInfo culture) : base(content, culture)
        {
            Initialize(content, culture);
        }
        protected PhotoCollection(IPublishedContent content) : base(content)
        {
            Initialize(content, null);
        }
        public override sealed void Initialize(IPublishedContent content, CultureInfo culture)
        {
            if (content != null)
            {
                UmbracoNaviHide = content.GetPropertyValue("UmbracoNaviHide").TryConvertTo(typeof(bool));
                PhotoList = GetChildren<Photo>(content);
            }
        }
    }
}
