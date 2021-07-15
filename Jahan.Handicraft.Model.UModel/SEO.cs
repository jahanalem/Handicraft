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
    public class Seo : ISeo
    {
        public string PageTitle { get; set; }
        public string MetaDescription { get; set; }
        public string MetaKeywords { get; set; }

        public static Seo GetAllProps(IPublishedContent content, CultureInfo culture)
        {
            Seo seo = new Seo
            {
                PageTitle = content.GetPropertyValue("PageTitle").ToString(),
                MetaDescription = content.GetPropertyValue("MetaDescription").ToString(),
                MetaKeywords = content.GetPropertyValue("MetaKeywords").ToString()
            };
            return seo;
        }
        public static string GetPageTitle(IPublishedContent content, CultureInfo culture)
        {
            return content.GetPropertyValue("PageTitle").ToString();
        }
        public static string GetMetaDescription(IPublishedContent content, CultureInfo culture)
        {
            return content.GetPropertyValue("MetaDescription").ToString();
        }
        public static string GetMetaKeywords(IPublishedContent content, CultureInfo culture)
        {
            return content.GetPropertyValue("MetaKeywords").ToString();
        }
    }
}
