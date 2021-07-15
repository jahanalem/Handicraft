using System;
using System.Globalization;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Web;
using Jahan.Infrastructure.Helper;
namespace Jahan.Handicraft.Model.UModel
{
    public class CacheSettings : ICacheSettings
    {
        public bool? Activate { get; set; }
        public int TimeValid { get; set; }

        public static CacheSettings GetAllProps(IPublishedContent content, CultureInfo culture)
        {
            CacheSettings cacheSettings = new CacheSettings
            {
                Activate = content.GetPropertyValue("Activate").ToBool(),
                TimeValid = content.GetPropertyValue("TimeValid").ToString().ToInt(600)
            };
            return cacheSettings;
        }
        public static bool? GetActivate(IPublishedContent content, CultureInfo culture)
        {
            if (content.GetPropertyValue("Activate") != null)
                return content.GetPropertyValue("Activate").ToString().ToBool();
            return null;
        }
        public static int GetTimeValid(IPublishedContent content, CultureInfo culture)
        {
            if(content.GetPropertyValue("TimeValid") !=null)
                return content.GetPropertyValue("TimeValid").ToString().ToInt(600);
            return 1;
        }
    }
}